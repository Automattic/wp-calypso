import { useSelect } from '@wordpress/data';
import { SITE_STORE } from '../stores';
import { useQuery } from './use-query';
import type { SiteSelect } from '@automattic/data-stores';

export function useSiteDomainsForSlug( siteSlug: string | null = null ) {
	const siteId = useSelect(
		( select ) => siteSlug && ( select( SITE_STORE ) as SiteSelect ).getSiteIdBySlug( siteSlug ),
		[ siteSlug ]
	);
	const siteDomains = useSelect(
		( select ) => siteId && ( select( SITE_STORE ) as SiteSelect ).getSiteDomains( siteId ),
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
