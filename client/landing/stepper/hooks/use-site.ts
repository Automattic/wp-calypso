import { useSelect } from '@wordpress/data';
import { SITE_STORE } from '../stores';
import { useSiteIdParam } from './use-site-id-param';
import { useSiteSlugParam } from './use-site-slug-param';

export interface Site {
	ID: number;
	name: string;
	URL: string;
}

export function useSite(): Site | null {
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
