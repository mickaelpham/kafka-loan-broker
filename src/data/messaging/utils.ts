import { type IHeaders } from 'kafkajs';

export const parseHeaders = (
  headers: IHeaders | undefined,
): Record<string, string | undefined> => {
  if (headers === undefined) {
    return {};
  }

  return Object.entries(headers).reduce(
    (acc, [key, value]) => ({
      ...acc,
      [key]: value?.toString(),
    }),
    {},
  );
};

export const parseValue = (
  value: Buffer | null,
): Record<string, string | undefined> => {
  return JSON.parse(value?.toString() ?? '{}');
};
