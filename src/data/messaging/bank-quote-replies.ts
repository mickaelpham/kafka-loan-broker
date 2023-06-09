import { Kafka, logLevel } from 'kafkajs';
import scatterGatherContainer from './scatter-gather-container';
import { ulid } from 'ulid';

const brokers = (process.env.KAFKA_BROKERS ?? '').split(',');

const kafka = new Kafka({
  brokers,
  clientId: 'bank-quote-replies',
  logLevel: logLevel.NOTHING,
});

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
