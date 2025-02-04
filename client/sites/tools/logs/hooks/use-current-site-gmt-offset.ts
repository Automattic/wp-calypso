import { useSelector } from 'calypso/state';
import getSiteSetting from 'calypso/state/selectors/get-site-setting';
import getSelectedSiteId from 'calypso/state/ui/selectors/get-selected-site-id';

/**
 * Returns the current site's GMT offset in hours.
 */
export function useCurrentSiteGmtOffset(): number {
	return useSelector( ( state ) => {
		const siteId = getSelectedSiteId( state );
		return ( getSiteSetting( state, siteId ?? 0, 'gmt_offset' ) as number | null ) ?? 0;
	} );
}
