import { pluginsQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { useAuth } from '../../../app/auth';
import { mapApiPluginsToDataViewPlugins } from '../utils';
import { useSitesById } from './use-sites-by-id';

export type PluginsEmptyReason = 'no-sites' | 'no-plugins';

/**
 * Decides whether Manage plugins has nothing to list, and why.
 *
 * The sites request can take several seconds, so nothing waits for it. Until it settles, the
 * answer comes from data that can prove emptiness: zero site counts on the user, or an empty
 * plugins response. Once the sites list settles, it has the last word.
 */
export function usePluginsEmptyReason(): PluginsEmptyReason | undefined {
	const { user } = useAuth();
	const {
		data: sitesPlugins,
		isLoading: isLoadingPlugins,
		isError: isPluginsError,
	} = useQuery( pluginsQuery() );
	const { sitesById, isLoadingSites, hasSites } = useSitesById();
	const hasListedPlugins = useMemo(
		() => mapApiPluginsToDataViewPlugins( sitesById, sitesPlugins ).length > 0,
		[ sitesById, sitesPlugins ]
	);

	if ( isPluginsError ) {
		return undefined;
	}

	if ( ! isLoadingSites && sitesById ) {
		if ( ! hasSites ) {
			return 'no-sites';
		}
		// Plugins are only listed for sites with `update_plugins`.
		if ( sitesById.size === 0 ) {
			return 'no-plugins';
		}
		if ( isLoadingPlugins ) {
			return undefined;
		}
		return hasListedPlugins ? undefined : 'no-plugins';
	}

	// A count only proves emptiness when it's zero.
	if ( user.visible_site_count === 0 ) {
		return 'no-sites';
	}
	// Plugins can only be managed on Atomic and Jetpack sites.
	if ( user.atomic_visible_site_count === 0 && user.jetpack_visible_site_count === 0 ) {
		return 'no-plugins';
	}
	if (
		! isLoadingPlugins &&
		Object.values( sitesPlugins?.sites ?? {} ).every( ( plugins ) => plugins.length === 0 )
	) {
		return 'no-plugins';
	}

	return undefined;
}
