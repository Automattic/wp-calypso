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
	/** The site's UTC offset in hours, e.g. `5.5` or `-8`. Used when there is no `timezone`. */
	gmtOffset: number;
	/** The site's IANA timezone, e.g. `America/New_York`. Empty for a site set to a fixed offset. */
	timezone?: string;
}

/**
 * The `±HH:MM` suffix of an ISO timestamp.
 * @param minutes The offset from UTC in minutes.
 */
function formatOffset( minutes: number ): string {
	const absolute = Math.abs( minutes );
	const pad = ( value: number ) => String( value ).padStart( 2, '0' );

	return `${ minutes < 0 ? '-' : '+' }${ pad( Math.floor( absolute / 60 ) ) }:${ pad( absolute % 60 ) }`;
}

/**
 * The offset from UTC, in minutes, that a timezone applies at an instant.
 * @param timezone An IANA timezone. An unknown one throws a RangeError.
 * @param instant  Milliseconds since the epoch.
 */
function zoneOffsetAt( timezone: string, instant: number ): number {
	const name =
		new Intl.DateTimeFormat( 'en-US', { timeZone: timezone, timeZoneName: 'longOffset' } )
			.formatToParts( instant )
			.find( ( part ) => part.type === 'timeZoneName' )?.value ?? '';
	const match = /GMT([+-])(\d{2}):(\d{2})/.exec( name );

	// UTC itself is written as a bare `GMT`.
	return match
		? ( match[ 1 ] === '-' ? -1 : 1 ) * ( Number( match[ 2 ] ) * 60 + Number( match[ 3 ] ) )
		: 0;
}

const MINUTE = 60000;
const DAY_LENGTH = 24 * 60 * MINUTE;

/**
 * The timestamp, with its offset, at which a day starts or ends in the site's timezone.
 * @param day   The calendar day, `YYYY-MM-DD`.
 * @param edge  Whether to give the first or the last millisecond of the day.
 * @param range The range, for its timezone or fixed offset.
 * @returns The ISO timestamp, or null when neither the timezone nor the offset is usable.
 */
function boundaryOf(
	day: string,
	edge: 'start' | 'end',
	range: PremiumAnalyticsRange
): string | null {
	const [ year, month, date ] = day.split( '-' ).map( Number );
	// The site clock time of the boundary, with its digits read as UTC.
	const wallClock =
		edge === 'start'
			? Date.UTC( year, month - 1, date )
			: Date.UTC( year, month - 1, date + 1 ) - 1;
	const format = ( instant: number, offset: number ) =>
		`${ new Date( instant + offset * MINUTE ).toISOString().slice( 0, 23 ) }${ formatOffset( offset ) }`;

	if ( range.timezone ) {
		const timezone = range.timezone;
		try {
			// A zone changes its offset at most once a day, so the offsets a day either side are all the clock time can have.
			const instants = [ -DAY_LENGTH, 0, DAY_LENGTH ].map(
				( shift ) => wallClock - zoneOffsetAt( timezone, wallClock + shift ) * MINUTE
			);
			const real = instants.filter(
				( instant ) => instant + zoneOffsetAt( timezone, instant ) * MINUTE === wallClock
			);
			// A repeated clock time has two instants, and the day takes the outer one. A skipped one, as at Havana's midnight or Nuuk's 23:00, takes the side inside the day.
			let instant = edge === 'start' ? Math.max( ...instants ) : Math.min( ...instants );
			if ( real.length ) {
				instant = edge === 'start' ? Math.min( ...real ) : Math.max( ...real );
			}
			return format( instant, zoneOffsetAt( timezone, instant ) );
		} catch {
			// An unknown timezone falls back to the fixed offset.
		}
	}

	if ( ! Number.isFinite( range.gmtOffset ) ) {
		return null;
	}
	const offset = Math.round( range.gmtOffset * 60 );
	return format( wallClock - offset * MINUTE, offset );
}

/**
 * A Premium Analytics dashboard route as a path relative to wp-admin. The dashboard's router keeps
 * its whole path in the `p` param, and reads a range as `from`/`to` timestamps with the offset in
 * effect on each day, as Jetpack's own `getAnalyticsUrl()` builds them.
 *
 * Kept free of imports so the Odyssey bundle can use it without pulling in the dashboard's data layer.
 * @param route The dashboard route, e.g. `/`, `/post/123` or `/reports/posts`.
 * @param range The days to open on. Left off when unusable, so the route opens on its default range.
 */
export function getPremiumAnalyticsPath( route = '/', range?: PremiumAnalyticsRange ): string {
	let path = route;

	if ( range && DAY.test( range.from ) && DAY.test( range.to ) ) {
		const from = boundaryOf( range.from, 'start', range );
		const to = boundaryOf( range.to, 'end', range );

		if ( from !== null && to !== null ) {
			const search = new URLSearchParams( { from, to } );
			path = `${ route }?${ search }`;
		}
	}

	return `admin.php?${ new URLSearchParams( { page: PREMIUM_ANALYTICS_PAGE, p: path } ) }`;
}
