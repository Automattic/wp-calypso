import { getSiteAdminUrl, getSiteSlug, usesWPAdminInterface } from '../sites/selectors';

export default function getPluginInstallUrl( state: AppState, siteId?: number | null ) {
	if ( ! usesWPAdminInterface( state, siteId ) ) {
		const siteSlug = getSiteSlug( state, siteId );
		return `/plugins/${ siteSlug }`;
	}

	return getSiteAdminUrl( state, siteId, 'plugin-install.php' );
}
