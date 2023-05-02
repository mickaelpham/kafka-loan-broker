import { ulid } from 'ulid';
import {
  gatherBankQuotes,
  type ApprovedBankLoanQuote,
  type RejectedBankLoanQuote,
} from './gather-bank-quotes';
import { retrieveCreditScore } from './retrieve-credit-score';
import { logger } from '../../web/logger';

interface NewLoanApplicationParams {
  ssn: string;
  amount: number;
}

interface NewLoanApplicationResult {
  quoteId: string;
  ssn: string;
  amount: number;
  creditScore: number;
  quotes: Array<ApprovedBankLoanQuote | RejectedBankLoanQuote>;
}

export const newLoanApplication = async ({
  ssn,
  amount,
}: NewLoanApplicationParams): Promise<NewLoanApplicationResult> => {
  const quoteId = ulid();

  logger.info('about to retrieve credit score', { ssn });
  const creditScore = await retrieveCreditScore(ssn);
  const quotes = await gatherBankQuotes({ ssn, amount, creditScore });

  return {
    quoteId,
    ssn,
    amount,
    creditScore,
    quotes,
  };
};
