/**
 * The wp-admin page the Premium Analytics ("Stats v2") dashboard is served from.
 */
const PREMIUM_ANALYTICS_PAGE = 'jetpack-premium-analytics-wp-admin';

const DAY = /^\d{4}-\d{2}-\d{2}$/;

/**
 * A range of whole days for a dashboard route to open on.
 */
export interface PremiumAnalyticsRange {
	/** The first day, `YYYY-MM-DD` in the site's timezone. */
	from: string;
	/** The last day, `YYYY-MM-DD` in the site's timezone. */
	to: string;
	/** The site's UTC offset in hours, e.g. `5.5` or `-8`. */
	gmtOffset: number;
}

/**
 * The `±HH:MM` suffix of an ISO timestamp for a UTC offset given in hours.
 * @param hours The offset in hours.
 */
function formatOffset( hours: number ): string {
	const minutes = Math.round( Math.abs( hours ) * 60 );
	const pad = ( value: number ) => String( value ).padStart( 2, '0' );

	return `${ hours < 0 ? '-' : '+' }${ pad( Math.floor( minutes / 60 ) ) }:${ pad( minutes % 60 ) }`;
}

/**
 * A Premium Analytics dashboard route as a path relative to wp-admin. The dashboard's router keeps
 * its whole path in the `p` param, and reads a range as `from`/`to` timestamps with the site's
 * offset, as Jetpack's own `getAnalyticsUrl()` builds them.
 *
 * Kept free of imports so the Odyssey bundle can use it without pulling in the dashboard's data layer.
 * @param route The dashboard route, e.g. `/`, `/post/123` or `/reports/posts`.
 * @param range The days to open on. Left off when unusable, so the route opens on its default range.
 */
export function getPremiumAnalyticsPath( route = '/', range?: PremiumAnalyticsRange ): string {
	let path = route;

	if (
		range &&
		DAY.test( range.from ) &&
		DAY.test( range.to ) &&
		Number.isFinite( range.gmtOffset )
	) {
		const offset = formatOffset( range.gmtOffset );
		const search = new URLSearchParams( {
			from: `${ range.from }T00:00:00.000${ offset }`,
			to: `${ range.to }T23:59:59.999${ offset }`,
		} );
		path = `${ route }?${ search }`;
	}

	return `admin.php?${ new URLSearchParams( { page: PREMIUM_ANALYTICS_PAGE, p: path } ) }`;
}
