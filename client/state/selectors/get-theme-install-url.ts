import { getSiteAdminUrl, getSiteSlug, usesWPAdminInterface } from '../sites/selectors';

export default function getThemeInstallUrl( state: AppState, siteId?: number | null ) {
	if ( ! usesWPAdminInterface( state, siteId ) ) {
		const siteSlug = getSiteSlug( state, siteId );
		return `/themes/${ siteSlug }`;
	}

	return getSiteAdminUrl( state, siteId, 'theme-install.php' );
}
