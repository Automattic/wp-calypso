import { useSelect } from '@wordpress/data';
import { SITE_STORE } from '../stores';
import { useQuery } from './use-query';

export function useSiteDomains() {
	const siteSlug = useQuery().get( 'siteSlug' );
	const siteId = useSelect(
		( select ) => siteSlug && select( SITE_STORE ).getSiteIdBySlug( siteSlug )
	);
	const siteDomains = useSelect(
		( select ) => siteId && select( SITE_STORE ).getSiteDomains( siteId )
	);

	if ( siteSlug && siteId && siteDomains ) {
		return siteDomains;
	}

	return null;
}
