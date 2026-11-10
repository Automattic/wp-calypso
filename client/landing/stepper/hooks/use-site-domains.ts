import { useSelect } from '@wordpress/data';
import { SITE_STORE } from '../stores';
import { useQuery } from './use-query';

export function useSiteDomainsForSlug( siteSlug: string | null = null ) {
	const siteId = useSelect(
		( select ) => siteSlug && select( SITE_STORE ).getSiteIdBySlug( siteSlug ),
		[ siteSlug ]
	);
	const siteDomains = useSelect(
		( select ) => siteId && select( SITE_STORE ).getSiteDomains( siteId ),
		[ siteId ]
	);

	if ( siteSlug && siteId && siteDomains ) {
		return siteDomains;
	}

	return null;
}

export function useSiteDomains() {
	const querySlug = useQuery().get( 'siteSlug' );
	return useSiteDomainsForSlug( querySlug );
}
