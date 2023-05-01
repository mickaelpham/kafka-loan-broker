import express, { type RequestHandler } from 'express';
import { isValidLoanAmount, isValidSsn } from './validation';
import { newLoanApplication } from '../../../business/flows/new-loan-application';

export const quotesRouter = express.Router();

quotesRouter.post('/quotes', (async (req, res) => {
  const { ssn, amount } = req.body;

  if (typeof ssn !== 'string' || !isValidSsn(ssn)) {
    res.status(400).send({ error: 'a valid SSN is required' });
    return;
  }

  if (typeof amount !== 'number' || !isValidLoanAmount(amount)) {
    res.status(400).send({ error: 'amount must be a positive integer' });
    return;
  }

  const result = await newLoanApplication({ ssn, amount });
  res.json(result);
}) as RequestHandler);
