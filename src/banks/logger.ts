import { createLogger, format, transports } from 'winston';

export const logger = createLogger({
  level: 'debug',
  defaultMeta: { service: 'bank' },
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
