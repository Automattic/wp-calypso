import { useSelect } from '@wordpress/data';
import { SITE_STORE } from 'calypso/landing/stepper/stores';
import { useSiteSlugParam } from './use-site-slug-param';
import type { BundledPlugin } from '../declarative-flow/plugin-bundle-data';
import type { SiteSelect } from '@automattic/data-stores';

export function useSitePluginSlug(): BundledPlugin {
	const siteSlugParam = useSiteSlugParam();
	const pluginSlug = useSelect(
		( select ) =>
			( select( SITE_STORE ) as SiteSelect ).getBundledPluginSlug( siteSlugParam || '' ),
		[ siteSlugParam ]
	) as BundledPlugin;

	return pluginSlug;
}
