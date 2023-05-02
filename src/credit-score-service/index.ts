import { Kafka, logLevel } from 'kafkajs';
import { logger } from './logger';
import { parseHeaders, parseValue } from '../data/messaging/utils';

const topic = process.env.KAFKA_TOPIC_CREDIT_SCORE_REQUESTS;
if (topic === undefined) {
  throw new Error(
    'missing KAFKA_TOPIC_CREDIT_SCORE_REQUESTS environment variable',
  );
}

const brokers = (process.env.KAFKA_BROKERS ?? '').split(',');
if (brokers.length === 0) {
  throw new Error('no Kafka brokers provided');
}

const kafka = new Kafka({
  brokers,
  clientId: 'credit-score-service',
  logLevel: logLevel.NOTHING,
});

const producer = kafka.producer();
const consumer = kafka.consumer({ groupId: 'credit-score-request-consumers' });

const MIN_SCORE = 500;
const UP_TO_RAND = 250;

const makeUpScore = (ssn: string): number => {
  const score = Math.floor(Math.random() * UP_TO_RAND) + MIN_SCORE;
  logger.info('making up score', { ssn, score });
  return score;
};

const run = async (): Promise<void> => {
  await Promise.all([producer.connect(), consumer.connect()]);
  await consumer.subscribe({ topic, fromBeginning: true });

  logger.info('started credit-score-service');

  await consumer.run({
    eachMessage: async ({ message }) => {
      const { correlationId, replyTo } = parseHeaders(message.headers);
      logger.info('received message');

      if (correlationId === undefined) {
        throw new Error('missing correlation ID');
      }

      if (replyTo === undefined) {
        throw new Error('missing replyTo topic');
      }

      const { ssn } = parseValue(message.value);
      if (ssn === undefined) {
        throw new Error('credit score request does not provide ssn');
      }

      const creditScore = makeUpScore(ssn);
      logger.info('ready to reply', { ssn, creditScore });

      await producer.send({
        topic: replyTo,
        messages: [
          {
            headers: { correlationId },
            value: JSON.stringify({ creditScore }),
          },
        ],
      });
    },
  });
};

run().catch(logger.error);
