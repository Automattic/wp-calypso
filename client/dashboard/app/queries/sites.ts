import { fetchSites } from '../../data/me-sites';
import { SITE_FIELDS, SITE_OPTIONS } from '../../data/site';
import type { FetchSitesOptions } from '../../data/me-sites';

export const sitesQuery = (
	fetchSitesOptions: FetchSitesOptions = { site_visibility: 'all', include_a8c_owned: true }
) => ( {
	queryKey: [ 'sites', SITE_FIELDS, SITE_OPTIONS, fetchSitesOptions ],
	queryFn: () => fetchSites( fetchSitesOptions ),
} );
