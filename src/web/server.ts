import { app } from './app';
import { logger } from './logger';

const port = process.env.HTTP_PORT ?? '3000';

app.listen(port, () => {
  logger.info('HTTP server started');
});
