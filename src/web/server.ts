import { bankQuoteReplies } from '../data/messaging/bank-quote-replies';
import { loanReplies } from '../data/messaging/loan-replies';
import { app } from './app';
import { logger } from './logger';

const port = process.env.HTTP_PORT ?? '3000';

loanReplies
  .start()
  .then(() => {
    logger.info('loan replies container started');
  })
  .catch(logger.error);

bankQuoteReplies
  .start()
  .then(() => {
    logger.info('bank quote replies container started');
  })
  .catch(logger.error);

app.listen(port, () => {
  logger.info('HTTP server started');
});
