import { __, _n, sprintf } from '@wordpress/i18n';

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
