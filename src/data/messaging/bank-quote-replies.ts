import { Kafka } from 'kafkajs';
import scatterGatherContainer from './scatter-gather-container';
import { ulid } from 'ulid';

const brokers = (process.env.KAFKA_BROKER ?? '').split(',');

const kafka = new Kafka({ brokers, clientId: 'bank-quote-replies' });

const replyTopic = process.env.KAFKA_TOPIC_BANK_QUOTE_REPLIES;
if (replyTopic === undefined) {
  throw new Error(
    'missing KAFKA_TOPIC_BANK_QUOTE_REPLIES environment variable',
  );
}

export const bankQuoteReplies = scatterGatherContainer({
  kafka,
  replyTopic,
  groupId: `bank-quote-replies-${ulid()}`,
});
