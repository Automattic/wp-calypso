import { Site } from '@automattic/api-core';

export const getAllowedPluginActions = ( site: Site, pluginSlug: string ) => {
	const autoManagedPlugins = [ 'jetpack', 'vaultpress', 'akismet' ];
	const siteIsAtomic = site.is_wpcom_atomic;
	const siteIsJetpack = site.jetpack;
	const hasManagePlugins = site.plan?.features.active.includes( 'manage-plugins' );
	const isManagedPlugin = siteIsAtomic && autoManagedPlugins.includes( pluginSlug );
	const canManagePlugins =
		( siteIsJetpack && ! siteIsAtomic ) || ( siteIsAtomic && hasManagePlugins );

	return {
		autoupdate: ! isManagedPlugin && canManagePlugins,
	};
};
