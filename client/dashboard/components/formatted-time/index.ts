import { __, sprintf } from '@wordpress/i18n';
import { useLocale } from '../../app/locale';
import { formatDate, formatDateWithOffset, formatYmd, parseYmdLocal } from '../../utils/datetime';

export function useFormattedTime(
	timestamp: string,
	formatOptions?: Intl.DateTimeFormatOptions,
	timezoneString?: string,
	gmtOffset?: number
) {
	const locale = useLocale();

	const date = new Date( timestamp );

	// Use timezone-aware formatting when timezone info is provided
	let formatted = formatDate( date, locale, formatOptions );
	if ( timezoneString ) {
		formatted = formatDate( date, locale, { ...formatOptions, timeZone: timezoneString } );
	} else if ( gmtOffset !== undefined ) {
		formatted = formatDateWithOffset( date, gmtOffset, locale, formatOptions );
	}

	if ( ! formatOptions?.dateStyle ) {
		// Determine "today" in the site's timezone, not browser's timezone
		let siteToday = new Date();
		if ( timezoneString || gmtOffset !== undefined ) {
			siteToday = parseYmdLocal( formatYmd( new Date(), timezoneString, gmtOffset ) ) || new Date();
		}

		let dateInSiteTimezone = date;
		if ( timezoneString || gmtOffset !== undefined ) {
			dateInSiteTimezone = parseYmdLocal( formatYmd( date, timezoneString, gmtOffset ) ) || date;
		}

		const isToday =
			dateInSiteTimezone.getDate() === siteToday.getDate() &&
			dateInSiteTimezone.getMonth() === siteToday.getMonth() &&
			dateInSiteTimezone.getFullYear() === siteToday.getFullYear();

		if ( isToday ) {
			if ( formatOptions?.timeStyle ) {
				// translators: time today
				return sprintf( __( 'Today at %s' ), formatted );
			}
			return __( 'Today' );
		} else if ( timezoneString ) {
			return formatDate( date, locale, {
				...formatOptions,
				dateStyle: 'long',
				timeZone: timezoneString,
			} );
		} else if ( gmtOffset !== undefined ) {
			return formatDateWithOffset( date, gmtOffset, locale, {
				...formatOptions,
				dateStyle: 'long',
			} );
		}

		return formatDate( date, locale, {
			...formatOptions,
			dateStyle: 'long',
		} );
	}

	return formatted;
}
