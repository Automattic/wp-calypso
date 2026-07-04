import { DEFAULT_START_TIME, DEFAULT_END_TIME } from '@automattic/date-range-picker';
import { dateI18n } from '@wordpress/date';
import { __, sprintf } from '@wordpress/i18n';
import { fromUnixTime, isValid as isValidDate } from 'date-fns';
import { formatDateWithOffset, getUtcOffsetDisplay } from '../../utils/datetime';
import type { PHPLog, ServerLog } from '@automattic/api-core';

type DateRange = { start: Date; end: Date };

const HOUR_MS = 3_600_000;

// Reuse the picker's whole-day defaults so "is this a custom time?" checks stay
// in sync. These reproduce the previous behavior: the range starts at the very
// beginning of the start day and ends at the last second of the end day.
export const DAY_START_TIME = DEFAULT_START_TIME;
export const DAY_END_TIME = DEFAULT_END_TIME;

type TimeOfDay = { hour: number; minute: number; second: number };

/**
 * Parse an "HH:MM" string into hour/minute. `second` fills the seconds slot —
 * pass 0 for a range start and 59 for a range end so a whole-minute selection
 * is inclusive of that entire minute (e.g. end "17:00" covers 17:00:00–17:00:59).
 */
const parseTimeOfDay = ( value: string, second: number ): TimeOfDay => {
	const [ rawHour, rawMinute ] = value.split( ':' );
	const hour = Number.parseInt( rawHour, 10 );
	const minute = Number.parseInt( rawMinute, 10 );
	return {
		hour: Number.isFinite( hour ) ? Math.min( Math.max( hour, 0 ), 23 ) : 0,
		minute: Number.isFinite( minute ) ? Math.min( Math.max( minute, 0 ), 59 ) : 0,
		second,
	};
};

const formatTimeOfDay = ( { hour, minute, second }: TimeOfDay ): string =>
	`${ String( hour ).padStart( 2, '0' ) }:${ String( minute ).padStart( 2, '0' ) }:${ String(
		second
	).padStart( 2, '0' ) }`;

/**
 * Helper function to convert a date to epoch seconds (UTC).
 */
const toUtcSecForSiteClock = (
	d: Date,
	hours: number,
	minutes: number,
	seconds: number,
	offsetHours: number
) =>
	Math.floor(
		( Date.UTC( d.getFullYear(), d.getMonth(), d.getDate(), hours, minutes, seconds ) -
			offsetHours * HOUR_MS ) /
			1000
	);

/**
 * Convert a local date range to inclusive epoch-second boundaries (UTC).
 * `startTime`/`endTime` are "HH:MM" times of day in the site clock; the defaults
 * cover the full start and end calendar days (unchanged from the prior behavior).
 */
export function buildTimeRangeInSeconds(
	start: Date,
	end: Date,
	timezoneString?: string,
	gmtOffset?: number,
	startTime: string = DAY_START_TIME,
	endTime: string = DAY_END_TIME
): { startSec: number; endSec: number } {
	const startOfRange = parseTimeOfDay( startTime, 0 );
	const endOfRange = parseTimeOfDay( endTime, 59 );

	if ( timezoneString ) {
		const startYmd = dateI18n( 'Y-m-d', start, timezoneString );
		const endYmd = dateI18n( 'Y-m-d', end, timezoneString );
		const startSec = Number(
			dateI18n( 'U', `${ startYmd } ${ formatTimeOfDay( startOfRange ) }`, timezoneString )
		);
		const endSec = Number(
			dateI18n( 'U', `${ endYmd } ${ formatTimeOfDay( endOfRange ) }`, timezoneString )
		);
		if ( Number.isFinite( startSec ) && Number.isFinite( endSec ) ) {
			return { startSec, endSec };
		}
	}
	if ( typeof gmtOffset === 'number' ) {
		const startSec = toUtcSecForSiteClock(
			start,
			startOfRange.hour,
			startOfRange.minute,
			startOfRange.second,
			gmtOffset
		);
		const endSec = toUtcSecForSiteClock(
			end,
			endOfRange.hour,
			endOfRange.minute,
			endOfRange.second,
			gmtOffset
		);
		return { startSec, endSec };
	}
	// last-resort fallback: browser local
	const applyTime = ( d: Date, { hour, minute, second }: TimeOfDay ) => {
		const copy = new Date( d );
		copy.setHours( hour, minute, second, 0 );
		return Math.floor( copy.getTime() / 1000 );
	};
	return { startSec: applyTime( start, startOfRange ), endSec: applyTime( end, endOfRange ) };
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

export function formatDateCell( {
	timezoneString,
	gmtOffset,
	locale,
	value,
	formatAsUTC,
}: {
	timezoneString?: string;
	gmtOffset?: number;
	locale: string;
	value?: string | number;
	formatAsUTC?: boolean;
} ) {
	if ( ! value ) {
		return '';
	}
	const dateFormat = 'M j, Y \\a\\t g:i A';
	const date = typeof value === 'number' ? new Date( value * 1000 ) : new Date( value );
	if ( formatAsUTC ) {
		return dateI18n( dateFormat, date, 'UTC' );
	}

	return timezoneString
		? dateI18n( dateFormat, date, timezoneString )
		: formatDateWithOffset( date, gmtOffset as number, locale, {
				dateStyle: 'medium',
				timeStyle: 'short',
		  } );
}

export function getDateTimeLabel( {
	timezoneString,
	gmtOffset,
	isLargeScreen,
}: {
	timezoneString?: string;
	gmtOffset?: number;
	isLargeScreen: boolean;
} ) {
	let dateTimeLabel: string = __( 'Date & time' );

	/* translators: %s is the site's timezone (e.g., "Europe/London") or UTC offset (e.g., "UTC+02:00") */
	const dateTimeWithTz = __( 'Date & time (%s)' );
	if ( timezoneString && isLargeScreen ) {
		dateTimeLabel = sprintf( dateTimeWithTz, timezoneString );
	} else if ( typeof gmtOffset === 'number' ) {
		dateTimeLabel = sprintf( dateTimeWithTz, getUtcOffsetDisplay( gmtOffset ) );
	}
	return dateTimeLabel;
}

// Logs helpers

export type PhpLogWithId = PHPLog & { id: string };
export type ServerLogWithId = ServerLog & { id: string };

// Build a stable, readable ID by joining meaningful parts.
const joinId = ( parts: Array< string | number | null | undefined > ): string =>
	parts
		.map( ( part ) => ( part === null || part === undefined ? '' : String( part ) ) )
		.join( '|' );

export function buildPhpLogsWithId( pages: Array< { logs?: PHPLog[] } > ): PhpLogWithId[] {
	const out: PhpLogWithId[] = [];
	pages.forEach( ( page, pageIndex ) => {
		const suffix = `p${ pageIndex + 1 }`;
		const items = page?.logs ?? [];
		items.forEach( ( php, index ) => {
			const id = joinId( [ php.timestamp, php.file, php.line, php.kind, php.name, suffix, index ] );
			out.push( { ...php, id } );
		} );
	} );
	return out;
}

export function buildServerLogsWithId( pages: Array< { logs?: ServerLog[] } > ): ServerLogWithId[] {
	const out: ServerLogWithId[] = [];
	pages.forEach( ( page, pageIndex ) => {
		const suffix = `p${ pageIndex + 1 }`;
		const items = page?.logs ?? [];
		items.forEach( ( server, index ) => {
			const id = joinId( [
				server.timestamp,
				server.request_type,
				server.status,
				server.request_url,
				server.user_ip,
				suffix,
				index,
			] );
			out.push( { ...server, id } );
		} );
	} );
	return out;
}
