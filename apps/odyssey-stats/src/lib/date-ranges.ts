import moment from 'moment';

/**
 * One option of the widget's range control. `unit` and `quantity` are the chart's buckets;
 * the lists cover the same days through `getRangeStartDate`. There is no hourly range
 * because top posts and referrers have no hourly period.
 */
export interface DateRange {
	id: DateRangeId;
	unit: 'day' | 'month';
	quantity: number;
}

export const DATE_RANGE_LAST_7_DAYS = 'last_7_days';
export const DATE_RANGE_LAST_30_DAYS = 'last_30_days';
export const DATE_RANGE_LAST_90_DAYS = 'last_90_days';
export const DATE_RANGE_LAST_12_MONTHS = 'last_12_months';

export type DateRangeId =
	| typeof DATE_RANGE_LAST_7_DAYS
	| typeof DATE_RANGE_LAST_30_DAYS
	| typeof DATE_RANGE_LAST_90_DAYS
	| typeof DATE_RANGE_LAST_12_MONTHS;

export const DEFAULT_DATE_RANGE_ID: DateRangeId = DATE_RANGE_LAST_7_DAYS;

export const DATE_RANGES: DateRange[] = [
	{ id: DATE_RANGE_LAST_7_DAYS, unit: 'day', quantity: 7 },
	{ id: DATE_RANGE_LAST_30_DAYS, unit: 'day', quantity: 30 },
	{ id: DATE_RANGE_LAST_90_DAYS, unit: 'day', quantity: 90 },
	{ id: DATE_RANGE_LAST_12_MONTHS, unit: 'month', quantity: 12 },
];

/**
 * Whether a value read back from storage is still a range the control offers.
 * @param value The stored value.
 */
export function isDateRangeId( value: unknown ): value is DateRangeId {
	return DATE_RANGES.some( ( range ) => range.id === value );
}

/**
 * Today in the site's timezone, as `YYYY-MM-DD`: the last day every range covers.
 * @param gmtOffset The site's offset from UTC, in hours.
 */
export function getSiteToday( gmtOffset: number ): string {
	return moment()
		.utcOffset( Number.isFinite( gmtOffset ) ? gmtOffset : 0 )
		.format( 'YYYY-MM-DD' );
}

/**
 * The first day a range covers, as `YYYY-MM-DD`. A summarized list counts back in days
 * whatever period it is given (`period=month&num=12` is twelve days), so the lists state
 * their window as this day to the last.
 * @param range   The selected range.
 * @param endDate The last day it covers, as `YYYY-MM-DD`.
 */
export function getRangeStartDate( range: DateRange, endDate: string ): string {
	const end = moment( endDate, 'YYYY-MM-DD' );

	// From the first of the earliest month, matching the chart's monthly buckets.
	const start =
		'month' === range.unit
			? end.startOf( 'month' ).subtract( range.quantity - 1, 'months' )
			: end.subtract( range.quantity - 1, 'days' );

	return start.format( 'YYYY-MM-DD' );
}

/**
 * The range for an id, or the default range for anything unrecognised.
 * @param id The range id.
 */
export function getDateRange( id: unknown ): DateRange {
	return (
		DATE_RANGES.find( ( range ) => range.id === id ) ??
		( DATE_RANGES.find( ( range ) => range.id === DEFAULT_DATE_RANGE_ID ) as DateRange )
	);
}
