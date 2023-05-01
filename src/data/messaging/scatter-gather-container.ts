import { type Kafka, type Message } from 'kafkajs';
import { ulid } from 'ulid';
import { parseHeaders } from './utils';

interface ScatterGatherContainer {
  start: () => Promise<void>;
  stop: () => Promise<void>;
  scatterAndGather: (args: {
    topic: string;
    message: Message;
    minReplies: number;
    maxReplies: number;
  }) => Promise<Message[]>;
}

interface GatherResponse {
  resolve: (value: Message[]) => void;
  minReplies: number;
  maxReplies: number;
  messages: Message[];
  resolved: boolean;
}

const GATHER_TIMEOUT = 5_000; // 5 seconds

export default ({
  kafka,
  groupId,
  replyTopic,
}: {
  kafka: Kafka;
  groupId: string;
  replyTopic: string;
}): ScatterGatherContainer => {
  const producer = kafka.producer();
  const consumer = kafka.consumer({ groupId });
  const replies = new Map<string, GatherResponse>();

  return {
    start: async () => {
      await Promise.all([producer.connect(), consumer.connect()]);
      await consumer.subscribe({ topic: replyTopic, fromBeginning: false });

      await consumer.run({
        eachMessage: async ({ message }) => {
          const { correlationId } = parseHeaders(message.headers);
          if (correlationId === undefined) {
            console.error('received message without correlationId');
            return;
          }

          const gatherResponse = replies.get(correlationId);
          if (gatherResponse === undefined) {
            console.log('message is not for this reply container');
            return;
          }
          const { messages, maxReplies, resolve } = gatherResponse;
          messages.push(message);

          if (messages.length === maxReplies) {
            gatherResponse.resolved = true;
            resolve(messages);
          }
        },
      });
    },

    stop: async () => {
      await Promise.all([producer.disconnect(), consumer.disconnect()]);
    },

    scatterAndGather: async ({ topic, message, minReplies, maxReplies }) =>
      await new Promise((resolve, reject) => {
        const correlationId = ulid();

        // add correlationId and replyTo headers
        const messageWithHeaders = {
          ...message,
          headers: {
            ...message.headers,
            correlationId,
            replyTo: replyTopic,
          },
        };

        // store a gather response in the container replies
        const gatherResponse: GatherResponse = {
          minReplies,
          maxReplies,
          resolve,
          messages: [],
          resolved: false,
        };

        replies.set(correlationId, gatherResponse);

        // send the message
        producer.send({ topic, messages: [messageWithHeaders] }).catch(reject);

        // set a timeout to ensure we don't gather for too long
        setTimeout(() => {
          // ensure we remove the gatherResponse from the map
          replies.delete(correlationId);

          const { resolved, minReplies, messages } = gatherResponse;

          // If the response was already resolved, do nothing else
          if (resolved) {
            return;
          }

          if (messages.length < minReplies) {
            reject(new Error('not enough responses gathered before timeout'));
          } else {
            resolve(messages);
          }
        }, GATHER_TIMEOUT);
      }),
  };
};
