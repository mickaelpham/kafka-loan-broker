import { loanReplies } from '../../data/messaging/loan-replies';
import { logger } from '../../web/logger';

const topic = process.env.KAFKA_TOPIC_CREDIT_SCORE_REQUESTS;
if (topic === undefined) {
  throw new Error(
    'missing KAFKA_TOPIC_CREDIT_SCORE_REQUESTS environment variable',
  );
}

export const retrieveCreditScore = async (ssn: string): Promise<number> => {
  logger.info('about to send message', { ssn });
  const reply = await loanReplies.sendAndReceive({
    message: { value: JSON.stringify({ ssn }) },
    topic,
  });

  const { creditScore } = JSON.parse(reply.value?.toString() ?? '{}');
  if (typeof creditScore !== 'number' || Number.isNaN(creditScore)) {
    throw new Error('reply does not contain a valid credit score');
  }

  return creditScore;
};
