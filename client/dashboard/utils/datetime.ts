import { dateI18n } from '@wordpress/date';
import { __, _n, sprintf } from '@wordpress/i18n';
import { parse, isValid, format } from 'date-fns';

const HOUR_MS = 3_600_000;
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

const msPerHour = 60 * 60 * 1000;
const msPerDay = 24 * msPerHour;

function getMsInUnit( unit: 'hours' | 'days' ): number {
	switch ( unit ) {
		case 'hours':
			return msPerHour;
		case 'days':
			return msPerDay;
		default:
			throw new Error(
				`Unknown unit '${ unit }'. Can only work with hours or days because other units (eg: months) are too vague.`
			);
	}
}

/**
 * Return true if the date is in the past X hours or days.
 */
export function isWithinLast( date: Date, count: number, unit: 'hours' | 'days' ): boolean {
	const now = new Date();
	const difference = ( now.getTime() - date.getTime() ) / getMsInUnit( unit );
	return difference >= 0 && difference <= count;
}

/**
 * Return true if the date is in the next X hours or days.
 */
export function isWithinNext( date: Date, count: number, unit: 'hours' | 'days' ): boolean {
	const now = new Date();
	const daysDifference = ( date.getTime() - now.getTime() ) / getMsInUnit( unit );
	return daysDifference >= 0 && daysDifference <= count;
}

/**
 * Return a string like "2 days from now" or "1 month ago" for a given date.
 *
 * Note that given the imprecision of date math and time zones, this may not be
 * totally accurate. Use it only in places where precision is not required.
 */
export function getRelativeTimeString( date: Date ): string {
	const now = new Date();
	const isPast = date < now;

	const startDate = isPast ? date : now;
	const endDate = isPast ? now : date;

	// Calculate year difference
	let years = endDate.getFullYear() - startDate.getFullYear();
	let months = endDate.getMonth() - startDate.getMonth();
	let days = endDate.getDate() - startDate.getDate();

	// Adjust for negative days
	if ( days < 0 ) {
		months--;
		const lastMonth = new Date( endDate.getFullYear(), endDate.getMonth(), 0 );
		days += lastMonth.getDate();
	}

	// Adjust for negative months
	if ( months < 0 ) {
		years--;
		months += 12;
	}

	// Determine the most significant unit
	let value;
	let unit: 'year' | 'month' | 'day' | 'hour' | 'minute';

	if ( years > 0 ) {
		value = years;
		unit = 'year';
	} else if ( months > 0 ) {
		value = months;
		unit = 'month';
	} else if ( days > 0 ) {
		value = days;
		unit = 'day';
	} else {
		// For same day, fall back to hours/minutes
		const diffInMs = Math.abs( date.getTime() - now.getTime() );
		const hours = Math.floor( diffInMs / ( 60 * 60 * 1000 ) );
		const minutes = Math.floor( diffInMs / ( 60 * 1000 ) );

		if ( hours > 0 ) {
			value = hours;
			unit = 'hour';
		} else if ( minutes > 0 ) {
			value = minutes;
			unit = 'minute';
		} else {
			return __( 'just now' );
		}
	}

	// Return appropriate string
	if ( isPast ) {
		switch ( unit ) {
			case 'year':
				// translators: value is a number
				return sprintf( _n( '%(value)s year ago', '%(value)s years ago', value ), {
					value,
				} );
			case 'month':
				// translators: value is a number
				return sprintf( _n( '%(value)s month ago', '%(value)s months ago', value ), {
					value,
				} );
			case 'day':
				// translators: value is a number
				return sprintf( _n( '%(value)s day ago', '%(value)s days ago', value ), {
					value,
				} );
			case 'hour':
				// translators: value is a number
				return sprintf( _n( '%(value)s hour ago', '%(value)s hours ago', value ), {
					value,
				} );
			case 'minute':
				// translators: value is a number
				return sprintf( _n( '%(value)s minute ago', '%(value)s minutes ago', value ), {
					value,
				} );
			default:
				return __( 'just now' );
		}
	}
	switch ( unit ) {
		case 'year':
			// translators: value is a number
			return sprintf( _n( '%(value)s year from now', '%(value)s years from now', value ), {
				value,
			} );
		case 'month':
			// translators: value is a number
			return sprintf( _n( '%(value)s month from now', '%(value)s months from now', value ), {
				value,
			} );
		case 'day':
			// translators: value is a number
			return sprintf( _n( '%(value)s day from now', '%(value)s days from now', value ), {
				value,
			} );
		case 'hour':
			// translators: value is a number
			return sprintf( _n( '%(value)s hour from now', '%(value)s hours from now', value ), {
				value,
			} );
		case 'minute':
			// translators: value is a number
			return sprintf( _n( '%(value)s minute from now', '%(value)s minutes from now', value ), {
				value,
			} );
		default:
			return __( 'just now' );
	}
}

/**
 * Format a Date into a credit card expiry format (MM/YY).
 *
 * The use of `MM/YY` should not be localized as it is an ISO standard across credit card forms: https://en.wikipedia.org/wiki/ISO/IEC_7813
 */
export function formatCreditCardExpiry( cardExpiryDate: Date ): string {
	return `${
		// Note that months are 0 based here so we have to add 1.
		cardExpiryDate.getMonth() + 1
	}/${ cardExpiryDate.getFullYear().toString().slice( -2 ) }`;
}

/**
 * Transform a credit card expiry date like `11/23` into a Date representing 2023-11-30.
 *
 * Returns the last day of the month because credit cards typically expire at the end of the valid month.
 */
export function getDateFromCreditCardExpiry( cardExpiryDate: string ): Date {
	const [ month, year ] = cardExpiryDate.split( '/' );
	if ( ! month || ! year ) {
		throw new Error( `Could not parse credit card date '${ cardExpiryDate }'` );
	}
	const monthNumber = parseInt( month );
	const yearNumber = parseInt( year );
	if ( isNaN( monthNumber ) || isNaN( yearNumber ) ) {
		throw new Error( `Could not parse credit card date '${ cardExpiryDate }'` );
	}
	const currentYear = new Date().getFullYear();
	const currentMillenniumPrefix = Math.floor( currentYear / 100 );
	const fullYear = parseInt( `${ currentMillenniumPrefix }${ yearNumber }` );
	if ( isNaN( fullYear ) ) {
		throw new Error( `Could not parse credit card date '${ cardExpiryDate }'` );
	}
	// Note that the Date constructor expects the month to be 0 indexed, so 0
	// is January, but specifying a 0 as the day "underflows" and goes to the
	// last day of the previous month, which allows us to pass the wrong index
	// and get the right result.
	return new Date( fullYear, monthNumber, 0 );
}

/**
 * Format a date with a given offset in hours -- used as a fallback if the timezone is not available.
 */
export function formatDateWithOffset(
	input: Date | string | number,
	offsetHours: number,
	locale: string,
	options: Intl.DateTimeFormatOptions = { dateStyle: 'long', timeStyle: 'short' }
) {
	let sourceDate: Date;

	if ( typeof input === 'number' ) {
		sourceDate = new Date( input * 1000 ); // epoch seconds
	} else if ( typeof input === 'string' ) {
		sourceDate = new Date( input ); // ISO string
	} else {
		sourceDate = input; // Date
	}

	const sourceTimestampMs = sourceDate.getTime();
	if ( Number.isNaN( sourceTimestampMs ) ) {
		return '';
	}

	const adjusted = new Date( sourceTimestampMs + offsetHours * HOUR_MS );
	return formatDate( adjusted, locale, { ...options, timeZone: 'UTC' } );
}

/**
 * Get a string representation of the UTC offset in the format "UTC±HH:MM".
 */
export function getUtcOffsetDisplay( offsetHours: number ): string {
	if ( ! offsetHours ) {
		return 'UTC';
	}
	let sign = '';
	if ( offsetHours > 0 ) {
		sign = '+';
	} else if ( offsetHours < 0 ) {
		sign = '-';
	}
	const abs = Math.abs( offsetHours );
	const hoursPart = String( Math.floor( abs ) ).padStart( 2, '0' );
	const minutesPart = String( Math.round( ( abs - Math.floor( abs ) ) * 60 ) ).padStart( 2, '0' );
	return `UTC${ sign }${ hoursPart }:${ minutesPart }`;
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
		const shifted = new Date( date.getTime() + gmtOffset * HOUR_MS );
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
