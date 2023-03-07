import { useSelect } from '@wordpress/data';
import { SITE_STORE } from '../stores';
import { useSiteIdParam } from './use-site-id-param';
import { useSiteSlugParam } from './use-site-slug-param';
import type { SiteSelect } from '@automattic/data-stores';

export function useSite() {
	const siteSlug = useSiteSlugParam();
	const siteIdParam = useSiteIdParam();
	const siteId = useSelect(
		( select ) => siteSlug && ( select( SITE_STORE ) as SiteSelect ).getSiteIdBySlug( siteSlug ),
		[]
	);
	const site = useSelect(
		( select ) =>
			( siteId || siteIdParam ) &&
			( select( SITE_STORE ) as SiteSelect ).getSite(
				( siteId ?? siteIdParam ) as string | number
			),
		[]
	);

	if ( ( siteSlug || siteIdParam ) && site ) {
		return site;
	}
	return null;
}
