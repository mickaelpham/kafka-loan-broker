import express from 'express';
import { quotesRouter } from './routes/quotes';
import morgan from 'morgan';
import { stream } from './logger';

export const app = express();

app.use(express.json());
app.use(morgan('dev', { stream }));

app.use(quotesRouter);
