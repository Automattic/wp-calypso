import { useSelect } from '@wordpress/data';
import { SITE_STORE } from '../stores';
import type { SiteSelect } from '@automattic/data-stores';

export function useSiteSetupError() {
	return useSelect( ( select ) => ( select( SITE_STORE ) as SiteSelect ).getSiteSetupError(), [] );
}
