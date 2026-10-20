import moment from 'moment';
import type { Moment } from 'moment';

/**
 * The latest key a chart range may reach: the site's today, floored at the
 * newest bucket actually charted. After a timezone change the data can hold
 * a bucket past the site's clock, and the chart must still cover it. Keys
 * are compared as strings at `format`'s granularity, which sidesteps
 * mixed-zone moment math; `newestBucket` may be any moment-parsable date.
 */
export function getRangeEndCeiling(
	siteToday: Moment,
	newestBucket?: string,
	format = 'YYYY-MM-DD'
): string {
	const todayKey = siteToday.format( format );
	if ( ! newestBucket ) {
		return todayKey;
	}
	const newestKey = moment( newestBucket ).format( format );
	return newestKey > todayKey ? newestKey : todayKey;
}

/**
 * `endKey` clamped to getRangeEndCeiling(), so a range that would run to
 * the end of an in-progress period stops at the site's today instead.
 */
export function clampRangeEnd(
	endKey: string,
	siteToday: Moment,
	newestBucket?: string,
	format = 'YYYY-MM-DD'
): string {
	const ceiling = getRangeEndCeiling( siteToday, newestBucket, format );
	return endKey > ceiling ? ceiling : endKey;
}
