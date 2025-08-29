import { fromUnixTime, isValid as isValidDate, startOfDay, endOfDay, subDays } from 'date-fns';
import { formatDateWithOffset } from '../../utils/datetime';
import type { PHPLog } from '../../data/site-logs';

type DateRange = { start: Date; end: Date };

/**
 * Get the default date range for the logs.
 * Uses site timezone for data fetching while keeping UTC display.
 */
export function getDefaultDateRange( timezoneString?: string, gmtOffset?: number ) {
	let today: Date;

	if ( timezoneString ) {
		// Use site timezone if available
		const now = new Date();
		const siteTime = new Intl.DateTimeFormat( 'en-US', {
			timeZone: timezoneString,
			year: 'numeric',
			month: 'numeric',
			day: 'numeric',
		} ).formatToParts( now );

		const year = parseInt( siteTime.find( ( p ) => p.type === 'year' )?.value || '0' );
		const month = parseInt( siteTime.find( ( p ) => p.type === 'month' )?.value || '0' ) - 1;
		const day = parseInt( siteTime.find( ( p ) => p.type === 'day' )?.value || '0' );

		today = new Date( year, month, day );
	} else if ( typeof gmtOffset === 'number' ) {
		// Use GMT offset if no timezone string
		const now = new Date();
		const utcTime = now.getTime();
		const siteTime = utcTime + gmtOffset * 60 * 60 * 1000;
		const siteDate = new Date( siteTime );

		today = new Date(
			Date.UTC( siteDate.getUTCFullYear(), siteDate.getUTCMonth(), siteDate.getUTCDate() )
		);
	} else {
		// Fallback to UTC (default behavior)
		const utcNow = new Date();
		today = new Date(
			Date.UTC( utcNow.getUTCFullYear(), utcNow.getUTCMonth(), utcNow.getUTCDate() )
		);
	}

	// Calculate start date (6 days ago from site's today)
	const start = subDays( today, 6 );

	return {
		start,
		end: today,
	};
}

/**
 * Convert a date range to Unix epoch seconds for API requests.
 */
export function buildTimeRangeInSeconds(
	start: Date,
	end: Date,
	timezoneString?: string,
	gmtOffset?: number
): { startSec: number; endSec: number } {
	if ( timezoneString ) {
		// For now, fall back to GMT offset approach for timezone strings
		const startDate = startOfDay( start );
		const endDate = startOfDay( end );

		const startSec = Math.floor( startDate.getTime() / 1000 );
		const endSec = Math.floor( endOfDay( endDate ).getTime() / 1000 );

		return { startSec, endSec };
	} else if ( typeof gmtOffset === 'number' ) {
		// Use GMT offset if no timezone string
		const startDate = startOfDay( start );
		const endDate = startOfDay( end );

		// Apply GMT offset to get site timezone boundaries
		const offsetMs = gmtOffset * 60 * 60 * 1000;
		const startInSiteTz = new Date( startDate.getTime() - offsetMs );
		const endInSiteTz = new Date( endDate.getTime() - offsetMs );

		const startSec = Math.floor( startInSiteTz.getTime() / 1000 );
		const endSec = Math.floor( endOfDay( endInSiteTz ).getTime() / 1000 );

		return { startSec, endSec };
	}

	// Fallback to UTC methods for consistency
	const startUTC = startOfDay( start );
	const endUTC = endOfDay( end );

	const startSec = Math.floor( startUTC.getTime() / 1000 );
	const endSec = Math.floor( endUTC.getTime() / 1000 );

	return { startSec, endSec };
}

/**
 * Convert a PHP log severity string to lowercase (to be used in a CSS class name).
 */
export const toSeverityClass = ( severity: PHPLog[ 'severity' ] ) =>
	severity.split( ' ' )[ 0 ].toLowerCase();

/**
 * Format a log date/time string for display.
 */
export function formatLogDateTimeForDisplay(
	dateTime: string,
	gmtOffset: number,
	locale: string,
	timezoneString?: string
): string {
	if ( timezoneString ) {
		const date = new Date( dateTime );

		return new Intl.DateTimeFormat( locale, {
			dateStyle: 'long',
			timeStyle: 'short',
			timeZone: timezoneString,
		} ).format( date );
	}

	return formatDateWithOffset( dateTime, gmtOffset, locale, {
		dateStyle: 'long',
		timeStyle: 'short',
	} );
}

/**
 * Get the initial date range from the URL search parameters.
 */
export function getInitialDateRangeFromSearch( search: string ): DateRange | null {
	const params = new URLSearchParams( search );
	const valueAsNumber = ( value?: string | null ) => ( value ? Number( value ) : NaN );
	const toDate = ( dateString?: string | null ) => {
		const num = valueAsNumber( dateString );
		if ( ! Number.isFinite( num ) ) {
			return undefined;
		}
		const date = fromUnixTime( num );
		return isValidDate( date ) ? date : undefined;
	};

	const start = toDate( params.get( 'from' ) );
	const end = toDate( params.get( 'to' ) );
	return start && end && start <= end ? { start, end } : null;
}
