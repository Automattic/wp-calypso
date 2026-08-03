import { dateI18n } from '@wordpress/date';
import { parse, isValid, format } from 'date-fns';

const YMD_REGEX = /^\d{4}-\d{2}-\d{2}$/;

export function formatDate(
	date: Date,
	locale: string,
	formatOptions: Intl.DateTimeFormatOptions = { dateStyle: 'medium' }
) {
	if ( isNaN( date.getTime() ) ) {
		return '';
	}
	return new Intl.DateTimeFormat( locale, formatOptions ).format( date );
}

/**
 * Parse a date string in the format "YYYY-MM-DD" (local time).
 */
export function parseYmdLocal( value: string ): Date | null {
	if ( ! YMD_REGEX.test( value ) ) {
		return null;
	}
	const parsed = parse( value, 'yyyy-MM-dd', new Date() );
	if ( ! isValid( parsed ) ) {
		return null;
	}
	// Ensure strict match (reject overflows like 2023-02-31 -> 2023-03-03)
	return format( parsed, 'yyyy-MM-dd' ) === value ? parsed : null;
}

/**
 * Format a date as a site calendar day (YYYY-MM-DD).
 */
export function formatYmd( date: Date, timezoneString?: string, gmtOffset?: number ) {
	if ( timezoneString ) {
		return dateI18n( 'Y-m-d', date, timezoneString );
	}
	if ( typeof gmtOffset === 'number' ) {
		const shifted = new Date( date.getTime() + gmtOffset * 60 * 60 * 1000 );
		const year = shifted.getUTCFullYear();
		const month = String( shifted.getUTCMonth() + 1 ).padStart( 2, '0' );
		const day = String( shifted.getUTCDate() ).padStart( 2, '0' );
		return `${ year }-${ month }-${ day }`;
	}
	return dateI18n( 'Y-m-d', date );
}

/**
 * Format a Date that already represents a site calendar day.
 * This avoids reapplying timezone math to dates coming from the picker or URL.
 */
export function formatSiteYmd( date: Date ) {
	const year = date.getFullYear();
	const month = String( date.getMonth() + 1 ).padStart( 2, '0' );
	const day = String( date.getDate() ).padStart( 2, '0' );
	return `${ year }-${ month }-${ day }`;
}
