const socialSecurityRegex = /^\d{3}-\d{2}-\d{4}$/;

export const isValidSsn = (ssn: string): boolean =>
  socialSecurityRegex.exec(ssn) !== null;

export const isValidLoanAmount = (amount: number): boolean =>
  Number.isInteger(amount) && amount > 0;
