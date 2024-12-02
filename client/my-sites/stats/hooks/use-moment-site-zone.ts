import moment, { Moment } from 'moment';
import { useLocalizedMoment } from 'calypso/components/localized-moment';
import { useSelector } from 'calypso/state';
import { getSiteOption } from 'calypso/state/sites/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';

export function getMomentSiteZone(
	state: object,
	siteId: number | null,
	localizedMoment?: () => Moment
) {
	const gmtOffset = getSiteOption( state, siteId, 'gmt_offset' ) as number;
	return ( localizedMoment || moment )().utcOffset( gmtOffset ?? 0 );
}

/**
 * Get moment object based on site timezone.
 */
export default function useMomentSiteZone() {
	const siteId = useSelector( getSelectedSiteId );
	const localizedMoment = useLocalizedMoment();
	return useSelector( ( state ) => getMomentSiteZone( state, siteId, localizedMoment ) );
}
