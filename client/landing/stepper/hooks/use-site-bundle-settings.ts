import { useSelect } from '@wordpress/data';
import { SITE_STORE } from 'calypso/landing/stepper/stores';
import useBundleSettings, {
	type BundleSettingsHookReturn,
} from 'calypso/my-sites/theme/hooks/use-bundle-settings';
import { useSiteSlugParam } from './use-site-slug-param';
import type { BundledPlugin } from '../declarative-flow/plugin-bundle-data';
import type { SiteSelect } from '@automattic/data-stores';

const useSiteBundleSettings = (): BundleSettingsHookReturn => {
	const siteSlugParam = useSiteSlugParam();
	const pluginSlug = useSelect(
		( select ) =>
			( select( SITE_STORE ) as SiteSelect ).getBundledPluginSlug( siteSlugParam || '' ),
		[ siteSlugParam ]
	) as BundledPlugin;
	const bundleSettings = useBundleSettings( pluginSlug );

	return bundleSettings;
};

export default useSiteBundleSettings;
