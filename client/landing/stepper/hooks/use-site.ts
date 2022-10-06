import { useSelect } from '@wordpress/data';
import { SITE_STORE } from '../stores';
import { useSiteIdParam } from './use-site-id-param';
import { useSiteSlugParam } from './use-site-slug-param';
import type { SiteDetails } from '@automattic/data-stores';

export function useSite(): SiteDetails | null {
	const siteSlug = useSiteSlugParam();
	const siteIdParam = useSiteIdParam();
	const siteId = useSelect(
		( select ) => siteSlug && select( SITE_STORE ).getSiteIdBySlug( siteSlug )
	);
	const site = useSelect(
		( select ) =>
			( siteId || siteIdParam ) &&
			select( SITE_STORE ).getSite( ( siteId ?? siteIdParam ) as string | number )
	);

	if ( ( siteSlug || siteIdParam ) && site ) {
		return site;
	}
	return null;
}
