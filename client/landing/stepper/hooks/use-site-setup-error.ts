import { useSelect } from '@wordpress/data';
import { SITE_STORE } from '../stores';

export function useSiteSetupError() {
	return useSelect( ( select ) => select( SITE_STORE ).getSiteSetupError() );
}
