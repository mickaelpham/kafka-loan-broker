import { ulid } from 'ulid';
import {
  gatherBankQuotes,
  type ApprovedBankLoanQuote,
  type RejectedBankLoanQuote,
} from './gather-bank-quotes';
// import { retrieveCreditScore } from './retrieve-credit-score';

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

  // const creditScore = await retrieveCreditScore(ssn);
  const quotes = await gatherBankQuotes({ ssn, amount, creditScore: 860 });

  return {
    quoteId,
    ssn,
    amount,
    creditScore: 860,
    quotes,
  };
};
