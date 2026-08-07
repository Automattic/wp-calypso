import moment from 'moment';

/**
 * Builds the CSV export filename so it matches the data selection.
 *
 * When a custom date range query is present (`start_date` + `date`), those dates
 * are used and the period segment is omitted (query.period is forced to `day` for
 * API reasons and is not meaningful in the filename). Otherwise the legacy period
 * object label and bounds are used.
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

	const dateLocale = period.startOf.locale();
	const customStart = query?.start_date ? moment( query.start_date, 'YYYY-MM-DD', true ) : null;
	const customEnd = query?.date ? moment( query.date, 'YYYY-MM-DD', true ) : null;
	const hasCustomDateRange = Boolean( customStart?.isValid() && customEnd?.isValid() );

	const startDate = hasCustomDateRange
		? customStart.locale( dateLocale ).format( 'L' )
		: period.startOf.format( 'L' );
	const endDate = hasCustomDateRange
		? customEnd.locale( dateLocale ).format( 'L' )
		: period.endOf.format( 'L' );

	if ( hasCustomDateRange ) {
		return [ siteSlug, path, startDate, endDate ].join( '-' ) + '.csv';
	}

	return [ siteSlug, path, period.period, startDate, endDate ].join( '-' ) + '.csv';
}
