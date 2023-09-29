import { useSelect } from '@wordpress/data';
import { SITE_STORE } from '../stores';
import { useQuery } from './use-query';
import type { SiteSelect } from '@automattic/data-stores';

export function useSiteDomains( selectedSiteSlug = null ) {
	const querySlug = useQuery().get( 'siteSlug' );
	const siteSlug = selectedSiteSlug ?? querySlug;
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
