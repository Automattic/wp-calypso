import { useTranslate } from 'i18n-calypso';
import { useSelector } from 'react-redux';
import { useLocalizedMoment } from 'calypso/components/localized-moment';
import { applySiteOffset } from 'calypso/lib/site/timezone';
import getSiteGmtOffset from 'calypso/state/selectors/get-site-gmt-offset';
import getSiteTimezoneValue from 'calypso/state/selectors/get-site-timezone-value';
import getSelectedSiteId from 'calypso/state/ui/selectors/get-selected-site-id';

/**
 * Custom hook that returns a function to format dates with site-specific timezone offset.
 * The returned function formats dates differently based on whether they occur today,
 * this year, or in previous years, and can optionally prefix with "Latest:" text.
 * @param {number|null} [selectedSiteId] - The site ID to use for timezone calculations.
 *                                              If null, uses the currently selected site.
 * @returns {Function} A date formatting function that accepts:
 *                     - dateTime: Date string or moment object to format
 *                     - withLatest: Boolean to include "Latest:" prefix (default: true)
 */
export default function useGetDisplayDate( selectedSiteId = null ) {
	const translate = useTranslate();
	const moment = useLocalizedMoment();

	const siteId = useSelector( ( state ) => selectedSiteId ?? getSelectedSiteId( state ) );
	const timezone = useSelector( ( state ) => getSiteTimezoneValue( state, siteId ) );
	const gmtOffset = useSelector( ( state ) => getSiteGmtOffset( state, siteId ) );

	const nowLocal = applySiteOffset( moment(), { timezone, gmtOffset } );

	return ( dateTime, withLatest = true ) => {
		const dateTimeLocal = applySiteOffset( moment( dateTime ), { timezone, gmtOffset } );

		const isToday = nowLocal.isSame( dateTimeLocal, 'day' );
		const isThisYear = nowLocal.isSame( dateTimeLocal, 'year' );

		let format;
		if ( isToday ) {
			format = 'LT';
		} else if ( isThisYear ) {
			format = 'MMM D, LT';
		} else {
			format = 'MMM D YYYY, LT';
		}

		const formattedDateTime = dateTimeLocal.format( format );

		if ( withLatest ) {
			return isToday
				? translate( 'Latest: Today, %s', {
						args: [ formattedDateTime ],
						comment: '',
				  } )
				: translate( 'Latest: %s', {
						args: [ formattedDateTime ],
						comment: '',
				  } );
		}

		return isToday
			? translate( 'Today, %s', {
					args: [ formattedDateTime ],
					comment: '',
			  } )
			: formattedDateTime;
	};
}
