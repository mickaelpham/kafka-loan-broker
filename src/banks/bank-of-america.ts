import { Kafka, logLevel } from 'kafkajs';
import { logger } from './logger';
import { parseHeaders } from '../data/messaging/utils';
import {
  type ApprovedBankLoanQuote,
  type RejectedBankLoanQuote,
} from '../business/flows/gather-bank-quotes';

const topic = process.env.KAFKA_TOPIC_BANK_QUOTE_REQUESTS;
if (topic === undefined) {
  throw new Error(
    'missing KAFKA_TOPIC_BANK_QUOTE_REQUESTS environment variable',
  );
}

const brokers = (process.env.KAFKA_BROKERS ?? '').split(',');
if (brokers.length === 0) {
  throw new Error('no Kafka brokers provided');
}

const kafka = new Kafka({
  brokers,
  clientId: 'boa-quotes',
  logLevel: logLevel.NOTHING,
});

const producer = kafka.producer();
const consumer = kafka.consumer({ groupId: 'boa-quotes-consumers' });

const APPROVAL_RATE = 0.75;
const BANK_NAME = 'Bank of America';

const makeUpQuote = (): ApprovedBankLoanQuote | RejectedBankLoanQuote => {
  if (Math.random() < APPROVAL_RATE) {
    return {
      bankName: BANK_NAME,
      interestRate: '2.3%',
      isApproved: true,
      loanDuration: '30 months',
    };
  } else {
    return {
      bankName: BANK_NAME,
      isApproved: false,
      reason: 'You are poor',
    };
  }
};

const run = async (): Promise<void> => {
  await Promise.all([producer.connect(), consumer.connect()]);
  await consumer.subscribe({ topic, fromBeginning: true });

  logger.info('started boa');

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

      const quote = makeUpQuote();
      logger.info('ready to reply', { quote });

      await producer.send({
        topic: replyTo,
        messages: [
          {
            headers: { correlationId },
            value: JSON.stringify({ quote }),
          },
        ],
      });
    },
  });
};

run().catch(logger.error);
