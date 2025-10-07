import type { Frequency, Weekday } from './types';

export const WEEKDAYS = [
	'Sunday',
	'Monday',
	'Tuesday',
	'Wednesday',
	'Thursday',
	'Friday',
	'Saturday',
] as const;
export const NEW_SCHEDULE_DEFAULT_TIME = '04:00';
export const NEW_SCHEDULE_DEFAULT_FREQUENCY: Frequency = 'daily';
export const NEW_SCHEDULE_DEFAULT_WEEKDAY: Weekday = 'Monday';
export const CRON_CHECK_INTERVAL = 5;
