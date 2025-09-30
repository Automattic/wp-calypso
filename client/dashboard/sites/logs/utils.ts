import { dateI18n } from '@wordpress/date';
import { __, sprintf } from '@wordpress/i18n';
import { startOfDay, endOfDay, fromUnixTime, isValid as isValidDate } from 'date-fns';
import { formatDateWithOffset, getUtcOffsetDisplay } from '../../utils/datetime';
import type { PHPLog, ServerLog } from '@automattic/api-core';

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
		const startSec = Number( dateI18n( 'U', `${ startYmd } 00:00:00`, timezoneString ) );
		const endSec = Number( dateI18n( 'U', `${ endYmd } 23:59:59`, timezoneString ) );
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

export const LOG_TABS = [
	{ name: 'activity', title: __( 'Activity' ) },
	{ name: 'php', title: __( 'PHP errors' ) },
	{ name: 'server', title: __( 'Web server' ) },
];

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
	let dateTimeLabel = __( 'Date & time' );

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
