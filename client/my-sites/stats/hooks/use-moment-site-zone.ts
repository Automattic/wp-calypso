import { createSelector } from '@automattic/state-utils';
import i18n from 'i18n-calypso';
import moment from 'moment';
import { useSelector } from 'calypso/state';
import { getSiteOption } from 'calypso/state/sites/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import { DATE_FORMAT } from '../constants';

export const getMomentSiteZone = createSelector(
	( state: object, siteId: number | null, dateFormat = DATE_FORMAT ) => {
		let localeSlug = i18n.getLocaleSlug();
		if ( localeSlug === null ) {
			localeSlug = 'en';
		}

		const localizedMoment = moment().locale( localeSlug );

		const gmtOffset = getSiteOption( state, siteId, 'gmt_offset' ) as number;
		if ( Number.isFinite( gmtOffset ) ) {
			// In all the components, `moment` is directly used, which defaults to the browser's local timezone.
			// As a result, we need to convert the moment object to the site's timezone for easier comparison like `isSame`.
			return moment( localizedMoment.utcOffset( gmtOffset ).format( dateFormat ) );
		}

		// Falls back to the browser's local timezone if no GMT offset is found
		return localizedMoment;
	},
	[ ( state, siteId ) => getSiteOption( state, siteId, 'gmt_offset' ), () => i18n.getLocaleSlug() ]
);

/**
 * Get moment object based on site timezone.
 */
export default function useMomentSiteZone() {
	const siteId = useSelector( getSelectedSiteId );
	return useSelector( ( state ) => getMomentSiteZone( state, siteId ) );
}
