import { SiteWithPluginData } from '../use-plugin';

export const getAllowedPluginActions = ( site: SiteWithPluginData, pluginSlug: string ) => {
	const autoManagedPlugins = [ 'jetpack', 'vaultpress', 'akismet' ];
	const siteIsAtomic = site.is_wpcom_atomic;
	const siteIsJetpack = site.jetpack;
	const hasManagePlugins = site.plan?.features.active.includes( 'manage-plugins' ) ?? false;
	const isAutoManagedPlugin = siteIsAtomic && autoManagedPlugins.includes( pluginSlug );
	const isManagedPlugin = isAutoManagedPlugin || ( siteIsAtomic && site.isPluginManaged );
	const canManagePlugins =
		( siteIsJetpack && ! siteIsAtomic ) || ( siteIsAtomic && hasManagePlugins );

	return {
		autoupdate: ! isManagedPlugin && canManagePlugins,
		// Managed (symlinked) plugins can be deleted — on Atomic this removes the
		// symlink, mirroring what the site does in wp-admin. Only the auto-managed
		// core plugins (Jetpack/VaultPress/Akismet) stay protected from deletion.
		canDelete: ! isAutoManagedPlugin && canManagePlugins,
		isManagedPlugin,
	};
};
