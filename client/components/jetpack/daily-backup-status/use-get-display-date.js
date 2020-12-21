/**
 * External dependencies
 */
import { useSelector } from 'react-redux';

/**
 * Internal dependencies
 */
import { useTranslate } from 'i18n-calypso';
import { useLocalizedMoment } from 'calypso/components/localized-moment';
import { applySiteOffset } from 'calypso/lib/site/timezone';
import getSelectedSiteId from 'calypso/state/ui/selectors/get-selected-site-id';
import getSiteTimezoneValue from 'calypso/state/selectors/get-site-timezone-value';
import getSiteGmtOffset from 'calypso/state/selectors/get-site-gmt-offset';

export default function useGetDisplayDate() {
	const translate = useTranslate();
	const moment = useLocalizedMoment();

	const siteId = useSelector( getSelectedSiteId );
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
				? translate( 'Latest: Today %s', {
						args: [ formattedDateTime ],
						comment: '',
				  } )
				: translate( 'Latest: %s', {
						args: [ formattedDateTime ],
						comment: '',
				  } );
		}

		return isToday
			? translate( 'Today %s', {
					args: [ formattedDateTime ],
					comment: '',
			  } )
			: formattedDateTime;
	};
}

// export const useGetDisplayDateForSite: DisplayDateHook = ( siteId ) => {
// 	const moment = useLocalizedMoment();
// 	const translate = useTranslate();
// 	const gmtOffset = useSelector( ( state ) => getSiteGmtOffset( state, siteId ) );
// 	const timezone = useSelector( ( state ) => getSiteTimezoneValue( state, siteId ) );

// 	return useCallback(
// 		( date ) => {
// 			if ( ! date ) {
// 				return undefined;
// 			}

// 			const siteDate = applySiteOffset( date, { gmtOffset, timezone } );

// 			const today = applySiteOffset( moment(), { gmtOffset, timezone } );
// 			if ( siteDate.isSame( today, 'day' ) ) {
// 				return translate( 'Today %(time)s', {
// 					args: { time: siteDate.format( 'LT' ) },
// 					comment: '%(time)s is a localized representation of the time of day',
// 				} );
// 			}

// 			const yesterday = moment( today ).subtract( 1, 'day' );
// 			if ( siteDate.isSame( yesterday, 'day' ) ) {
// 				return translate( 'Yesterday %(time)s', {
// 					args: { time: siteDate.format( 'LT' ) },
// 					comment: '%(time)s is a localized representation of the time of day',
// 				} );
// 			}

// 			return siteDate.format( 'LLL' );
// 		},
// 		[ moment, translate, gmtOffset, timezone ]
// 	);
// };
