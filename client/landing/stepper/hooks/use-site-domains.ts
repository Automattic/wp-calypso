import { useSelect } from '@wordpress/data';
import { SITE_STORE } from '../stores';
import { useQuery } from './use-query';
import type { SiteSelect } from '@automattic/data-stores';

export function useSiteDomains() {
	const siteSlug = useQuery().get( 'siteSlug' );
	const siteId = useSelect(
		( select ) => siteSlug && ( select( SITE_STORE ) as SiteSelect ).getSiteIdBySlug( siteSlug ),
		[]
	);
	const siteDomains = useSelect(
		( select ) => siteId && ( select( SITE_STORE ) as SiteSelect ).getSiteDomains( siteId ),
		[]
	);

	if ( siteSlug && siteId && siteDomains ) {
		return siteDomains;
	}

	return null;
}
