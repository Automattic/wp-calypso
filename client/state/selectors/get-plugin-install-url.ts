import { getSiteAdminUrl, getSiteSlug, isAdminInterfaceWPAdmin } from '../sites/selectors';
import type { AppState } from 'calypso/types';

export default function getPluginInstallUrl( state: AppState, siteId?: number | null ) {
	if ( ! isAdminInterfaceWPAdmin( state, siteId ) ) {
		const siteSlug = getSiteSlug( state, siteId );
		return `/plugins/${ siteSlug }`;
	}

	return getSiteAdminUrl( state, siteId, 'plugin-install.php' );
}
