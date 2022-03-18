import { useSelect } from '@wordpress/data';
import { SITE_STORE } from '../stores';
import { useQuery } from './use-query';

export function useSite() {
	const siteSlug = useQuery().get( 'siteSlug' );
	const site = useSelect( ( select ) => siteSlug && select( SITE_STORE ).getSite( siteSlug ) );

	if ( siteSlug && site ) {
		return site;
	}
	return null;
}
