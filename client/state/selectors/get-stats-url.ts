import { getSiteAdminUrl, getSiteSlug, usesWPAdminInterface } from '../sites/selectors';

export default function getStatsUrl( state: AppState, siteId?: number | null ) {
	if ( ! usesWPAdminInterface( state, siteId ) ) {
		const siteSlug = getSiteSlug( state, siteId );
		return `/stats/${ siteSlug }`;
	}

	return getSiteAdminUrl( state, siteId, 'admin.php?page=stats' );
}
