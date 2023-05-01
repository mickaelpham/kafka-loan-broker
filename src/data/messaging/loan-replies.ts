import { Kafka } from 'kafkajs';
import replyContainer from './reply-container';
import { ulid } from 'ulid';

const brokers = (process.env.KAFKA_BROKERS ?? '').split(',');

const kafka = new Kafka({ brokers, clientId: 'loan-replies' });

const replyTopic = process.env.KAFKA_TOPIC_LOAN_REPLIES;
if (replyTopic === undefined) {
  throw new Error('missing KAFKA_TOPIC_LOAN_REPLIES environment variable');
}

export const loanReplies = replyContainer({
  kafka,
  replyTopic,
  groupId: `loan-replies-${ulid()}`,
});
