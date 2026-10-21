import moment from 'moment';

/**
 * The YYYY-MM key, in the site's timezone, of the month the post was
 * published — the month buckets the Months tab renders are site-local, so
 * the publish boundary must be too.
 *
 * `post_date` is a naive site-local timestamp: `momentSiteZone` interprets
 * it as site wall time directly. The `post_date_gmt` fallback is GMT, so it
 * is parsed as an absolute time first and then converted into the site's
 * zone (a GMT timestamp near midnight can belong to a different site-local
 * month). Returns null when both are missing or unparsable, so callers can
 * skip trimming.
 * @param {Object} post - the stats response's `post` object.
 * @param {Function} momentSiteZone - the factory from `getMomentSiteZone`.
 * @returns {?string} the publish month key, e.g. '2024-05'.
 */
export function getPublishMonthKey( post, momentSiteZone ) {
	const publishMoment = post?.post_date
		? momentSiteZone( post.post_date )
		: post?.post_date_gmt && momentSiteZone( moment.utc( post.post_date_gmt ) );
	return publishMoment && publishMoment.isValid() ? publishMoment.format( 'YYYY-MM' ) : null;
}
