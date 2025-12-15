import { SiteWithPluginData } from '../use-plugin';

export const getAllowedPluginActions = ( site: SiteWithPluginData, pluginSlug: string ) => {
	const autoManagedPlugins = [ 'jetpack', 'vaultpress', 'akismet' ];
	const siteIsAtomic = site.is_wpcom_atomic;
	const siteIsJetpack = site.jetpack;
	const hasManagePlugins = site.plan?.features.active.includes( 'manage-plugins' );
	const isManagedPlugin =
		siteIsAtomic && ( autoManagedPlugins.includes( pluginSlug ) || site.isPluginManaged );
	const canManagePlugins =
		( siteIsJetpack && ! siteIsAtomic ) || ( siteIsAtomic && hasManagePlugins );

	return {
		autoupdate: ! isManagedPlugin && canManagePlugins,
		isManagedPlugin,
	};
};
