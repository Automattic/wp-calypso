import { useSelect } from '@wordpress/data';
import { SITE_STORE } from '../stores';

export function useIsSiteAtomic( siteId: number | string ): boolean | null {
	return useSelect( ( select ) => select( SITE_STORE ).isSiteAtomic( siteId ) );
}
