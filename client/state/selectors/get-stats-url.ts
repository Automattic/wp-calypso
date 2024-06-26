import { getSiteAdminUrl, getSiteSlug, isAdminInterfaceWPAdmin } from '../sites/selectors';
import type { AppState } from 'calypso/types';

export default function getStatsUrl( state: AppState, siteId?: number | null ) {
	if ( ! isAdminInterfaceWPAdmin( state, siteId ) ) {
		const siteSlug = getSiteSlug( state, siteId );
		return `/stats/${ siteSlug }`;
	}

	return getSiteAdminUrl( state, siteId, 'admin.php?page=stats' );
}
