import {
	fetchWpOrgPlugin,
	fetchWpOrgPluginIcons,
	fetchMarketplacePlugin,
	fetchMarketplacePlugins,
	installPlugin,
	WPORG_ICONS_BATCH_SIZE,
} from '@automattic/api-core';
import { mutationOptions, queryOptions, useQueries } from '@tanstack/react-query';
import { invalidatePlugins, invalidateSitePlugins } from './site-plugins';

export const marketplacePluginQuery = ( slug: string ) =>
	queryOptions( {
		queryKey: [ 'marketplace-plugin', slug ],
		queryFn: () => fetchMarketplacePlugin( slug ),
	} );

export const marketplacePluginsQuery = () =>
	queryOptions( {
		queryKey: [ 'marketplace-plugins' ],
		queryFn: () => fetchMarketplacePlugins(),
	} );

export const wpOrgPluginQuery = ( slug: string, locale: string ) =>
	queryOptions( {
		queryKey: [ 'wp-org-plugin', slug, locale ],
		queryFn: () => fetchWpOrgPlugin( slug, locale ),
	} );

type IconWaiter = {
	resolve: ( icon: string | null ) => void;
	reject: ( error: unknown ) => void;
};

const pendingIconSlugs = new Map< string, IconWaiter[] >();
let iconFlushScheduled = false;

const flushIconRequests = () => {
	iconFlushScheduled = false;

	const waiting = [ ...pendingIconSlugs ];
	pendingIconSlugs.clear();

	for ( let index = 0; index < waiting.length; index += WPORG_ICONS_BATCH_SIZE ) {
		const batch = waiting.slice( index, index + WPORG_ICONS_BATCH_SIZE );

		fetchWpOrgPluginIcons( batch.map( ( [ slug ] ) => slug ) ).then(
			( icons ) =>
				batch.forEach( ( [ slug, waiters ] ) =>
					waiters.forEach( ( waiter ) => waiter.resolve( icons[ slug ] ?? null ) )
				),
			( error ) =>
				batch.forEach( ( [ , waiters ] ) =>
					waiters.forEach( ( waiter ) => waiter.reject( error ) )
				)
		);
	}
};

/**
 * Queues one slug, resolving it from a request shared with everything else
 * queued in the same tick.
 *
 * Callers that learn their slugs in instalments get one request per instalment,
 * and should wait for the full set. The queue is module state, which holds only
 * because nothing prefetches these queries server-side.
 * @param slug the plugin slug to resolve
 * @returns the icon URL, or null when wp.org has no icon for it
 */
const loadWpOrgPluginIcon = ( slug: string ) =>
	new Promise< string | null >( ( resolve, reject ) => {
		pendingIconSlugs.set( slug, [
			...( pendingIconSlugs.get( slug ) ?? [] ),
			{ resolve, reject },
		] );

		if ( ! iconFlushScheduled ) {
			iconFlushScheduled = true;
			setTimeout( flushIconRequests );
		}
	} );

export const wpOrgPluginIconQuery = ( slug: string ) =>
	queryOptions( {
		queryKey: [ 'wp-org-plugin-icon', slug ],
		queryFn: () => loadWpOrgPluginIcon( slug ),
		staleTime: Infinity,
		// Not persisted: one request per page load beats an entry per plugin ever seen.
		meta: { persist: false },
	} );

/**
 * Resolves real wp.org icon URLs for a list of plugin slugs.
 *
 * Keyed per slug so a growing list adds keys rather than replacing them.
 * @param slugs plugin slugs to resolve
 * @returns icon URL by slug, omitting plugins wp.org has no icon for
 */
export const useWpOrgPluginIcons = ( slugs: string[] ): Record< string, string > =>
	useQueries( {
		queries: slugs.map( ( slug ) => wpOrgPluginIconQuery( slug ) ),
		combine: ( results ) =>
			results.reduce< Record< string, string > >( ( icons, { data }, index ) => {
				if ( data ) {
					icons[ slugs[ index ] ] = data;
				}
				return icons;
			}, Object.create( null ) ),
	} );

export const installPluginMutation = () =>
	mutationOptions( {
		meta: { statId: 'plugin-install' },
		mutationFn: ( vars: { siteId: number; slug: string } ) =>
			installPlugin( vars.siteId, vars.slug ),
		onSuccess: ( _data, vars ) => {
			// Refresh the plugin data so usePlugin sees the newly installed plugin.
			// We invalidate both the per-site plugins list and the aggregated plugins
			// query that `usePlugin` relies on to compute sitesWith/WithoutThisPlugin.
			invalidateSitePlugins( vars.siteId );
			invalidatePlugins();
		},
	} );
