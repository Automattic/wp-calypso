import { translate } from 'i18n-calypso';

export const DEFAULT_HOUR = 9;

export const DAILY_OPTION = {
	label: translate( 'Daily' ),
	value: 'daily',
};

export const WEEKLY_OPTION = {
	label: translate( 'Weekly' ),
	value: 'weekly',
};

export const DAY_OPTIONS = [
	{
		label: translate( 'Monday' ),
		value: '1',
	},
	{
		label: translate( 'Tuesday' ),
		value: '2',
	},
	{
		label: translate( 'Wednesday' ),
		value: '3',
	},
	{
		label: translate( 'Thursday' ),
		value: '4',
	},
	{
		label: translate( 'Friday' ),
		value: '5',
	},
	{
		label: translate( 'Saturday' ),
		value: '6',
	},
	{
		label: translate( 'Sunday' ),
		value: '0',
	},
];

export const HOUR_OPTIONS = [
	{
		label: '01',
		value: '1',
	},
	{
		label: '02',
		value: '2',
	},
	{
		label: '03',
		value: '3',
	},
	{
		label: '04',
		value: '4',
	},
	{
		label: '05',
		value: '5',
	},
	{
		label: '06',
		value: '6',
	},
	{
		label: '07',
		value: '7',
	},
	{
		label: '08',
		value: '8',
	},
	{
		label: '09',
		value: '9',
	},
	{
		label: '10',
		value: '10',
	},
	{
		label: '11',
		value: '11',
	},
	{
		label: '12',
		value: '12',
	},
];

export const PERIOD_OPTIONS = [
	{
		label: translate( 'AM' ),
		value: 'am',
	},
	{
		label: translate( 'PM' ),
		value: 'pm',
	},
];

export const CRON_CHECK_INTERVAL = 5;
