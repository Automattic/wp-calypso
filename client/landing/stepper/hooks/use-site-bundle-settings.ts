import useBundleSettings, {
	type BundleSettingsHookReturn,
} from 'calypso/my-sites/theme/hooks/use-bundle-settings';
import useSitePluginSlug from './use-site-plugin-slug';

const useSiteBundleSettings = (): BundleSettingsHookReturn => {
	const pluginSlug = useSitePluginSlug();
	const bundleSettings = useBundleSettings( pluginSlug );

	return bundleSettings;
};

export default useSiteBundleSettings;
