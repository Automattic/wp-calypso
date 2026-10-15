import { siteByIdQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import type { Site } from '@automattic/api-core';

export function useCheckoutSite( siteId: number | null | undefined ) {
	return useQuery( { ...siteByIdQuery( siteId ?? 0 ), enabled: !! siteId } );
}

export function getJetpackConnectionActivePlugins( site: Site | undefined ): string[] {
	const plugins = site?.options?.jetpack_connection_active_plugins;
	return Array.isArray( plugins ) ? plugins : [];
}

/**
 * Whether the site runs Jetpack (the full plugin or a standalone plugin like
 * Jetpack Backup) and is not hosted on WordPress.com.
 */
export function isJetpackNotAtomicSite( site: Site | undefined ): boolean {
	if ( ! site || site.is_wpcom_atomic ) {
		return false;
	}
	return site.jetpack || getJetpackConnectionActivePlugins( site ).length > 0;
}

export function getSiteAdminUrl( site: Site | undefined, path = '' ): string | undefined {
	const adminUrl = site?.options?.admin_url;
	if ( ! adminUrl ) {
		return undefined;
	}
	return adminUrl + path.replace( /^\//, '' );
}

const JETPACK_PLUGIN_ADMIN_PAGES: Record< string, string > = {
	jetpack: 'admin.php?page=my-jetpack',
	'jetpack-backup': 'admin.php?page=jetpack-backup',
	'jetpack-social': 'admin.php?page=jetpack-social',
};

/**
 * Returns the wp-admin page of the site's Jetpack plugin, preferring the full
 * Jetpack plugin over standalone ones.
 */
export function getJetpackCheckoutRedirectUrl( site: Site | undefined ): string | undefined {
	const plugins = getJetpackConnectionActivePlugins( site );
	const plugin = plugins.includes( 'jetpack' )
		? 'jetpack'
		: plugins.find( ( slug ) => slug in JETPACK_PLUGIN_ADMIN_PAGES );
	return plugin ? JETPACK_PLUGIN_ADMIN_PAGES[ plugin ] : undefined;
}

/**
 * The slug of the site's plan, or `undefined` when it has none or it expired.
 */
export function getActivePlanSlug( site: Site | undefined ): string | undefined {
	return site?.plan && ! site.plan.expired ? site.plan.product_slug : undefined;
}
