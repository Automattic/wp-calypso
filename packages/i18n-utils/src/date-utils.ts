const aSecond = 1000;
const aMinute = aSecond * 60;
const anHour = aMinute * 60;
const aDay = anHour * 24;

/**
 * Get localized relative time string for past timestamp.
 * @param options The parameters to be used.
 * @param options.timestamp Web timestamp (milliseconds since Epoch)
 * @param options.locale Locale slug
 * @param options.now The date to be used for "now" in the relative calculation
 * @param options.style The style to be used for formatting. Acceptable values: long, short or narrow
 *   Returns '' for future dates and errors.
 */
export const getRelativeTimeString = ( {
	timestamp,
	locale = 'en',
	now = Date.now(),
	style = 'narrow',
}: {
	timestamp: number;
	locale: string;
	now?: number;
	style?: 'long' | 'short' | 'narrow';
} ): string => {
	const delta = now - timestamp;

	if ( delta < 0 ) {
		return '';
	}

	try {
		const formatter = new Intl.RelativeTimeFormat( locale, { style } );

		if ( delta < aSecond ) {
			// Super-accurate timing is not critical; pretend a second has elapsed.
			return formatter.format( -1, 'seconds' );
		}

		if ( delta < aMinute ) {
			return formatter.format( -1 * Math.round( delta / aSecond ), 'seconds' );
		}

		if ( delta < anHour ) {
			return formatter.format( -1 * Math.round( delta / aMinute ), 'minutes' );
		}

		if ( delta < aDay ) {
			return formatter.format( -1 * Math.round( delta / anHour ), 'hours' );
		}

		return formatter.format( -1 * Math.round( delta / aDay ), 'days' );
	} catch ( error ) {
		return '';
	}
};

/**
 * Get ISO date format for timestamp.
 * @param {number} timestamp Web timestamp (milliseconds since Epoch)
 * @returns {string} Formatted ISO date, e.g. '2020-12-20'
 */
export const getISODateString = ( timestamp: number ) => {
	return new Date( timestamp ).toISOString().split( 'T' )[ 0 ];
};

/**
 * Get localized short date format for timestamp.
 * @param {number} timestamp Web timestamp (milliseconds since Epoch)
 * @param {string} locale Locale slug
 * @returns {string} Formatted localized date, e.g. 'Dec 20, 2021' for US English.
 *   Falls back to ISO date string if anything goes wrong.
 */
export const getShortDateString = ( timestamp: number, locale = 'en' ) => {
	try {
		const formatter = new Intl.DateTimeFormat( locale, {
			year: 'numeric',
			month: 'short',
			day: 'numeric',
		} );
		return formatter.format( new Date( timestamp ) );
	} catch ( error ) {
		return getISODateString( timestamp );
	}
};

/**
 * Get localized numeric date format for timestamp.
 * @param {number} timestamp Web timestamp (milliseconds since Epoch)
 * @param {string} locale Locale slug
 * @returns {string} Formatted localized date, e.g. '12/20/2021' for US English
 *   Falls back to ISO date string if anything goes wrong.
 */
export const getNumericDateString = ( timestamp: number, locale = 'en' ) => {
	try {
		const formatter = new Intl.DateTimeFormat( locale, {
			year: 'numeric',
			month: 'numeric',
			day: 'numeric',
		} );
		return formatter.format( new Date( timestamp ) );
	} catch ( error ) {
		return getISODateString( timestamp );
	}
};

/**
 * Get localized full date and time format for timestamp including hours and minutes.
 * @param {number} timestamp Web timestamp (milliseconds since Epoch)
 * @param {string} locale Locale slug
 * @returns {string} Formatted localized date and time, e.g. '12/20/2021, 3:30 PM' for US English
 *   Falls back to ISO date string if anything goes wrong.
 */
export const getNumericDateTimeString = ( timestamp: number, locale = 'en' ) => {
	try {
		const formatter = new Intl.DateTimeFormat( locale, {
			year: 'numeric',
			month: 'numeric',
			day: 'numeric',
			hour: 'numeric',
			minute: 'numeric',
		} );
		return formatter.format( new Date( timestamp ) );
	} catch ( error ) {
		return getISODateString( timestamp );
	}
};
