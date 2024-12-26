import i18n from 'i18n-calypso';
import moment from 'moment';
import { useSelector } from 'calypso/state';
import { getSiteOption } from 'calypso/state/sites/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';

export function getMomentSiteZone( state: object, siteId: number | null ) {
	let localeSlug = i18n.getLocaleSlug();
	if ( localeSlug === null ) {
		localeSlug = 'en';
	}

	const localizedMoment = moment().locale( localeSlug );

	const gmtOffset = getSiteOption( state, siteId, 'gmt_offset' ) as number;
	if ( Number.isFinite( gmtOffset ) ) {
		return localizedMoment.utcOffset( gmtOffset );
	}

	// Falls back to the browser's local timezone if no GMT offset is found
	return localizedMoment;
}

/**
 * Get moment object based on site timezone.
 */
export default function useMomentSiteZone() {
	const siteId = useSelector( getSelectedSiteId );
	return useSelector( ( state ) => getMomentSiteZone( state, siteId ) );
}
