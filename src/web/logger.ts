import split from 'split';
import { createLogger, format, transports } from 'winston';

export const logger = createLogger({
  level: 'info',
  defaultMeta: { service: 'web' },
  transports: [
    new transports.Console({
      format: format.combine(
        format.colorize(),
        format.printf(
          // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
          (log) => `${log.service} | ${log.level} | ${log.message}`,
        ),
      ),
    }),
  ],
});

export const stream = split().on('data', (message) => {
  logger.info(message);
});
