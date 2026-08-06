import moment from 'moment';

/**
 * Builds the CSV export filename so it matches the data selection.
 *
 * When a custom date range query is present (`start_date` + `date`), those dates
 * and the query period are used. Otherwise the legacy period object bounds are used.
 * @param {Object} options
 * @param {string} options.siteSlug Site slug used as the filename prefix.
 * @param {string} options.path Stats module path segment (e.g. "posts").
 * @param {Object} options.period Period object with `period`, `startOf`, and `endOf`.
 * @param {Object} [options.query] Stats query; custom ranges include `start_date` and `date`.
 * @param {boolean} [options.includeDates] Pass false for exports that are not date-scoped
 * (e.g. the all-time Emails summary) to omit the period and date segments.
 * @returns {string} Filename ending in `.csv`.
 */
export function getStatsCsvFileName( { siteSlug, path, period, query, includeDates = true } ) {
	if ( ! includeDates ) {
		return [ siteSlug, path ].join( '-' ) + '.csv';
	}

	const hasCustomDateRange = Boolean( query?.start_date && query?.date );
	const periodLabel = hasCustomDateRange && query.period ? query.period : period.period;

	const startDate = hasCustomDateRange
		? moment( query.start_date, 'YYYY-MM-DD' ).format( 'L' )
		: period.startOf.format( 'L' );
	const endDate = hasCustomDateRange
		? moment( query.date, 'YYYY-MM-DD' ).format( 'L' )
		: period.endOf.format( 'L' );

	return [ siteSlug, path, periodLabel, startDate, endDate ].join( '-' ) + '.csv';
}
