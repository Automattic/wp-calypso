import { useSelect } from '@wordpress/data';
import { SITE_STORE } from 'calypso/landing/stepper/stores';
import { useSiteSlugParam } from './use-site-slug-param';
import type { BundledPlugin } from 'calypso/landing/stepper/declarative-flow/flows/plugin-bundle-flow/plugin-bundle-data';

export function useSitePluginSlug(): BundledPlugin {
	const siteSlugParam = useSiteSlugParam();
	const pluginSlug = useSelect(
		( select ) => select( SITE_STORE ).getBundledPluginSlug( siteSlugParam || '' ),
		[ siteSlugParam ]
	) as BundledPlugin;

	return pluginSlug;
}
