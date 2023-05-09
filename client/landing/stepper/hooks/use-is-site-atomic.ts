import { useSelect } from '@wordpress/data';
import { SITE_STORE } from '../stores';
import type { SiteSelect } from '@automattic/data-stores';

export function useIsSiteAtomic( siteId: number | string ): boolean | null {
	return useSelect(
		( select ) => ( select( SITE_STORE ) as SiteSelect ).isSiteAtomic( siteId ),
		[ siteId ]
	);
}
