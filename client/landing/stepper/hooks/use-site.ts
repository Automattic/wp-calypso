import { useSelect } from '@wordpress/data';
import { SITE_STORE } from '../stores';
import { useQuery } from './use-query';

export function useSite() {
	const siteSlug = useQuery().get( 'siteSlug' );
	const siteId = useSelect(
		( select ) => siteSlug && select( SITE_STORE ).getSiteIdBySlug( siteSlug )
	);
	const site = useSelect( ( select ) => siteId && select( SITE_STORE ).getSite( siteId ) );

	if ( siteSlug && siteId && site ) {
		return site;
	}
	return null;
}
