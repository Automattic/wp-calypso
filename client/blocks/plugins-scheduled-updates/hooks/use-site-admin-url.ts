import { useSelector } from 'calypso/state';
import { getSiteAdminUrl } from 'calypso/state/sites/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';

export function useSiteAdminUrl() {
	const siteId = useSelector( getSelectedSiteId );
	const siteAdminUrl = useSelector( ( state ) => getSiteAdminUrl( state, siteId ) );

	return siteAdminUrl;
}
