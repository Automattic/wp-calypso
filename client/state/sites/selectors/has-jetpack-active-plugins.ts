import type { SiteDetails } from '@automattic/data-stores';

/**
 * Check if site has active Jetpack plugins.
 */
export default function hasJetpackActivePlugins( site: SiteDetails | null ) {
	return site?.options?.jetpack_connection_active_plugins?.length > 0;
}
