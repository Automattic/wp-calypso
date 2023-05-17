import { useSelect } from '@wordpress/data';
import { SITE_STORE } from '../stores';
import { useSiteIdParam } from './use-site-id-param';
import { useSiteSlugParam } from './use-site-slug-param';
import type { SiteSelect } from '@automattic/data-stores';

export function useSite() {
	const siteSlug = useSiteSlugParam();
	const siteIdParam = useSiteIdParam();

	const site = useSelect(
		( select ) => {
			const siteStore = select( SITE_STORE ) as SiteSelect;
			const siteKey = siteSlug ?? siteIdParam;

			return siteKey ? siteStore.getSite( siteKey as string | number ) : null;
		},
		[ siteSlug, siteIdParam ]
	);

	return site;
}
