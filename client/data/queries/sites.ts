import { fetchSites } from '../api/me-sites';
import { SITE_FIELDS, SITE_OPTIONS } from '../api/site';
import type { FetchSitesOptions } from '../api/me-sites';

export const sitesQuery = (
	fetchSitesOptions: FetchSitesOptions = { site_visibility: 'visible', include_a8c_owned: false }
) => ( {
	queryKey: [ 'sites', SITE_FIELDS, SITE_OPTIONS, fetchSitesOptions ],
	queryFn: () => fetchSites( fetchSitesOptions ),
} );
