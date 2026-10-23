import { TZDate } from '@date-fns/tz';
import { dateI18n } from '@wordpress/date';
import { __, sprintf } from '@wordpress/i18n';
import { startOfDay, endOfDay } from 'date-fns';
import { formatDateWithOffset, getUtcOffsetDisplay } from '../../utils/datetime';
import { getIntlLocale } from '../../utils/locale';
import type { PHPLog, ServerLog } from '@automattic/api-core';
import type { Badge } from '@wordpress/ui';
import type { ComponentProps } from 'react';

type BadgeIntent = NonNullable< ComponentProps< typeof Badge >[ 'intent' ] >;

const HOUR_MS = 3_600_000;
const SECONDS_PER_DAY = 86_400;

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
 * Serialize site calendar days, held as browser-local Dates, to inclusive UTC seconds.
 * The Dates are day carriers, not instants to format in the site timezone again.
 */
export function buildTimeRangeInSeconds(
	start: Date,
	end: Date,
	timezoneString?: string,
	gmtOffset?: number
): { startSec: number; endSec: number } {
	if ( timezoneString ) {
		const startSec = Math.floor(
			new TZDate(
				start.getFullYear(),
				start.getMonth(),
				start.getDate(),
				0,
				0,
				0,
				timezoneString
			).getTime() / 1000
		);
		const endSec = Math.floor(
			new TZDate(
				end.getFullYear(),
				end.getMonth(),
				end.getDate(),
				23,
				59,
				59,
				timezoneString
			).getTime() / 1000
		);
		if ( Number.isFinite( startSec ) && Number.isFinite( endSec ) ) {
			return { startSec, endSec };
		}
	}
	if ( typeof gmtOffset === 'number' ) {
		const startSec = toUtcSecForSiteClock( start, 0, 0, 0, gmtOffset );
		const endSec = toUtcSecForSiteClock( end, 0, 0, 0, gmtOffset ) + SECONDS_PER_DAY - 1;
		return { startSec, endSec };
	}
	// last-resort fallback: browser local
	const startSec = Math.floor( startOfDay( start ).getTime() / 1000 );
	const endSec = Math.floor( endOfDay( end ).getTime() / 1000 );
	return { startSec, endSec };
}

export const toSeverityIntent = ( severity: PHPLog[ 'severity' ] ): BadgeIntent => {
	switch ( severity ) {
		case 'Fatal error':
			return 'high';
		case 'Warning':
			return 'medium';
		case 'Deprecated':
			return 'informational';
		case 'User':
		default:
			return 'none';
	}
};

export const toRequestTypeIntent = ( requestType: ServerLog[ 'request_type' ] ): BadgeIntent => {
	switch ( requestType ) {
		case 'DELETE':
			return 'high';
		case 'GET':
			return 'stable';
		case 'POST':
			return 'informational';
		default:
			return 'none';
	}
};

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

		return new Intl.DateTimeFormat( getIntlLocale( locale ), {
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

export const formatLogDetailValue = ( value: string | number | null | undefined ): string =>
	value === null || value === undefined || String( value ).trim() === '' ? '-' : String( value );

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
