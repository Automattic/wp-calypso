import { useTranslate } from 'i18n-calypso';
import { useSelector } from 'react-redux';
import { useLocalizedMoment } from 'calypso/components/localized-moment';
import { applySiteOffset } from 'calypso/lib/site/timezone';
import getSiteGmtOffset from 'calypso/state/selectors/get-site-gmt-offset';
import getSiteTimezoneValue from 'calypso/state/selectors/get-site-timezone-value';
import getSelectedSiteId from 'calypso/state/ui/selectors/get-selected-site-id';

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
