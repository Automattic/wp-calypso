import { getSiteAdminUrl, getSiteSlug, isAdminInterfaceWPAdmin } from '../sites/selectors';
import type { AppState } from 'calypso/types';

export default function getThemeInstallUrl( state: AppState, siteId?: number | null ) {
	if ( ! isAdminInterfaceWPAdmin( state, siteId ) ) {
		const siteSlug = getSiteSlug( state, siteId );
		return `/themes/${ siteSlug }`;
	}

	return getSiteAdminUrl( state, siteId, 'theme-install.php' );
}
