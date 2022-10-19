import type { SiteDetails } from '@automattic/data-stores';

/**
 * Get the list of active Jetpack plugins for a site.
 */
export default function getJetpackActivePlugins( site: SiteDetails | null ) {
	return site?.options?.jetpack_connection_active_plugins;
}
