import moment from 'moment';
import { Unit } from '../typings';

/**
 * The date ranges offered by the Stats widget's range control.
 *
 * A single range drives both halves of the widget: the visits chart and the
 * Top Posts / Top Referrers lists. `unit` and `quantity` feed `/stats/visits`,
 * which buckets by them. The lists ask for the same window a different way —
 * see `getRangeStartDate` — because a summarized list counts in days whatever
 * period it is given.
 *
 * `unit` doubles as the period segment of a Stats deep link
 * (`/stats/<unit>/posts/<siteId>`); both `day` and `month` are valid there.
 *
 * Note there is no hourly range: the Stats API has no hourly period for
 * top posts or referrers, so an "hour" option could not keep the chart and the
 * lists in sync.
 */
export interface DateRange {
	id: DateRangeId;
	unit: Unit;
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
 * Whether a value is one of the supported range ids.
 * @param value Candidate value, typically read back from storage.
 */
export function isDateRangeId( value: unknown ): value is DateRangeId {
	return DATE_RANGES.some( ( range ) => range.id === value );
}

/**
 * The first day a range covers, as `YYYY-MM-DD`.
 *
 * The lists are fetched with `summarize=1`, where the API counts back in days from
 * `date` and ignores the period it was given: `period=month&num=12` summarizes twelve
 * days rather than twelve months. So the lists state the window as `period=day` plus
 * an explicit `start_date`, as the Stats page does, and this works that date out.
 * @param range   The selected range.
 * @param endDate The last day it covers, as `YYYY-MM-DD`.
 */
export function getRangeStartDate( range: DateRange, endDate: string ): string {
	const end = moment( endDate, 'YYYY-MM-DD' );

	// A month range runs from the first of its earliest month, so the window matches the
	// chart's buckets rather than ending mid-month.
	const start =
		'month' === range.unit
			? end.startOf( 'month' ).subtract( range.quantity - 1, 'months' )
			: end.subtract( range.quantity - 1, 'days' );

	return start.format( 'YYYY-MM-DD' );
}

/**
 * Resolve a range id to its query parameters, falling back to the default
 * range for anything unrecognised — a stale or hand-edited stored value
 * should degrade to the default view rather than break the widget.
 * @param id The range id to resolve.
 */
export function getDateRange( id: unknown ): DateRange {
	return (
		DATE_RANGES.find( ( range ) => range.id === id ) ??
		( DATE_RANGES.find( ( range ) => range.id === DEFAULT_DATE_RANGE_ID ) as DateRange )
	);
}
