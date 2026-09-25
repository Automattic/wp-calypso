import { Unit } from '../typings';

/**
 * The date ranges offered by the Stats widget's range control.
 *
 * A single range drives both halves of the widget: the visits chart and the
 * Top Posts / Top Referrers lists. `unit` and `quantity` therefore feed two
 * different APIs under different parameter names — `unit`/`quantity` for
 * `/stats/visits`, `period`/`num` for `/stats/top-posts` and `/stats/referrers`
 * — but they are deliberately the same values, so the two halves can never
 * describe different windows.
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
