import { bankQuoteReplies } from '../../data/messaging/bank-quote-replies';

interface LoanApplication {
  ssn: string;
  amount: number;
  creditScore: number;
}

interface BankLoanQuote {
  bankName: string;
  isApproved: boolean;
}

export interface ApprovedBankLoanQuote extends BankLoanQuote {
  isApproved: true;
  interestRate: string;
  loanDuration: string;
}

export interface RejectedBankLoanQuote extends BankLoanQuote {
  isApproved: false;
  reason: string;
}

const topic = process.env.KAFKA_TOPIC_BANK_QUOTE_REQUESTS;
if (topic === undefined) {
  throw new Error(
    'missing KAFKA_TOPIC_BANK_QUOTE_REQUESTS environment variable',
  );
}

export const gatherBankQuotes = async (
  application: LoanApplication,
): Promise<Array<ApprovedBankLoanQuote | RejectedBankLoanQuote>> => {
  const reply = await bankQuoteReplies.scatterAndGather({
    message: { value: JSON.stringify(application) },
    topic,
    minReplies: 3,
    maxReplies: 5,
  });

  const quotes = reply.map((message) =>
    JSON.parse(message.value?.toString() ?? '{}'),
  );

  // FIXME: should we validate the response to ensure the schema did not change?
  return quotes;
};
