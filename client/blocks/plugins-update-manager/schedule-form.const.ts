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

export const HOUR_OPTIONS = [ ...Array( 12 ).keys() ].map( ( i ) => ( {
	label: ( i + 1 ).toString().padStart( 2, '0' ),
	value: ( i + 1 ).toString(),
} ) );

export const HOUR_OPTIONS_24 = [ ...Array( 24 ).keys() ].map( ( i ) => ( {
	label: i.toString().padStart( 2, '0' ) + ':00',
	value: i.toString(),
} ) );

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
