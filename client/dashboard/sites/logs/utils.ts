import { dateI18n } from '@wordpress/date';
import { startOfDay, endOfDay, fromUnixTime, isValid as isValidDate } from 'date-fns';
import { formatDateWithOffset } from '../../utils/datetime';
import type { PHPLog } from '../../data/site-logs';

type DateRange = { start: Date; end: Date };

const HOUR_MS = 3_600_000;

/**
 * Convert a local date range to inclusive epoch-second boundaries (UTC).
 * Covers the full start and end calendar days.
 */
export function buildTimeRangeInSeconds(
	start: Date,
	end: Date,
	timezoneString?: string,
	gmtOffset?: number
): { startSec: number; endSec: number } {
	if ( timezoneString ) {
		const startYmd = dateI18n( 'Y-m-d', start, timezoneString );
		const endYmd = dateI18n( 'Y-m-d', end, timezoneString );
		const startSec = +dateI18n( 'U', `${ startYmd } 00:00:00`, timezoneString );
		const endSec = +dateI18n( 'U', `${ endYmd } 23:59:59`, timezoneString );
		if ( Number.isFinite( startSec ) && Number.isFinite( endSec ) ) {
			return { startSec, endSec };
		}
	}
	if ( typeof gmtOffset === 'number' ) {
		const startLocal = startOfDay( start ).getTime();
		const endLocal = endOfDay( end ).getTime();
		const shiftMs = gmtOffset * HOUR_MS;
		return {
			startSec: Math.floor( ( startLocal - shiftMs ) / 1000 ),
			endSec: Math.floor( ( endLocal - shiftMs ) / 1000 ),
		};
	}
	// last-resort fallback: browser local
	const startSec = Math.floor( startOfDay( start ).getTime() / 1000 );
	const endSec = Math.floor( endOfDay( end ).getTime() / 1000 );
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
