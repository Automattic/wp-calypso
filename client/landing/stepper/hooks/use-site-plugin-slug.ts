import { useSelect } from '@wordpress/data';
import { useSearchParams } from 'react-router-dom';
import { SITE_STORE } from 'calypso/landing/stepper/stores';
import { bundleStepsSettings, type BundledPlugin } from '../declarative-flow/plugin-bundle-data';
import { useSiteSlugParam } from './use-site-slug-param';
import type { SiteSelect } from '@automattic/data-stores';

export function useSitePluginSlug(): BundledPlugin {
	const siteSlugParam = useSiteSlugParam();
	const [ urlParams ] = useSearchParams();
	const pluginSlugFromURL = urlParams.get( 'pluginSlug' );
	const pluginSlug = useSelect(
		( select ) =>
			( select( SITE_STORE ) as SiteSelect ).getBundledPluginSlug( siteSlugParam || '' ),
		[ siteSlugParam ]
	) as BundledPlugin;

	if ( pluginSlugFromURL && bundleStepsSettings[ pluginSlugFromURL ] ) {
		return pluginSlugFromURL;
	}

	return pluginSlug;
}
