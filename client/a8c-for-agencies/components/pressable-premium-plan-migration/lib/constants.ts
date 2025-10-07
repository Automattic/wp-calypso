// We want to show the incentive until the end of the day in UTC.
export const PRESSABLE_PREMIUM_PLAN_MIGRATION_INCENTIVE_END_DATE = new Date(
	'2025-10-31T23:59:59Z'
);

export const migrationIncentiveEndDateString =
	PRESSABLE_PREMIUM_PLAN_MIGRATION_INCENTIVE_END_DATE.toLocaleDateString( 'en-US', {
		year: 'numeric',
		month: 'long',
		day: 'numeric',
		timeZone: 'UTC', // we want to show the same date in all timezones
	} );
