import { useSelect } from '@wordpress/data';
import { SITE_STORE } from '../stores';
import { useQuery } from './use-query';

export function useSiteSetupError() {
	const siteSlug = useQuery().get( 'siteSlug' );
	const siteId = useSelect(
		( select ) => siteSlug && select( SITE_STORE ).getSiteIdBySlug( siteSlug )
	);

	return useSelect( ( select ) => siteId && select( SITE_STORE ).getSiteSetupError( siteId ) );
}
