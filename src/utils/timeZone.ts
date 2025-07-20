import { toZonedTime, format } from "date-fns-tz";

const EGYPT_TIMEZONE = "Africa/Cairo";

export function getCurrentEgyptTime(): string {
  const now = new Date();
  const time = toZonedTime(now, EGYPT_TIMEZONE);
  return format(time, "dd/MM/yyyy HH:mm", { timeZone: EGYPT_TIMEZONE });
}

export function convertToEgyptTime(date: Date): Date {
  return toZonedTime(date, EGYPT_TIMEZONE);
}
