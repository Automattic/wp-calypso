import {
	clearObjectCache,
	clearEdgeCache,
	fetchEdgeCacheStatus,
	updateEdgeCacheStatus,
} from '@automattic/api-core';
import { mutationOptions, queryOptions } from '@tanstack/react-query';
import { queryClient } from './query-client';

export const siteObjectCacheLastClearedTimestampQuery = ( siteId: number ) =>
	queryOptions( {
		queryKey: [ 'site', siteId, 'object-cache', 'last-cleared-timestamp' ],
		queryFn: () => Promise.resolve( 0 ),
		staleTime: Infinity,
	} );

export const siteObjectCacheClearMutation = ( siteId: number ) =>
	mutationOptions( {
		meta: { statId: 'site-object-cache-clear' },
		mutationFn: ( reason: string ) => clearObjectCache( siteId, reason ),
		onSuccess: () => {
			queryClient.setQueryData(
				siteObjectCacheLastClearedTimestampQuery( siteId ).queryKey,
				new Date().valueOf()
			);
		},
	} );

export const siteEdgeCacheLastClearedTimestampQuery = ( siteId: number ) =>
	queryOptions( {
		queryKey: [ 'site', siteId, 'edge-cache', 'last-cleared-timestamp' ],
		queryFn: () => Promise.resolve( 0 ),
		staleTime: Infinity,
	} );

export const siteEdgeCacheClearMutation = ( siteId: number ) =>
	mutationOptions( {
		meta: { statId: 'site-edge-cache-clear' },
		mutationFn: () => clearEdgeCache( siteId ),
		onSuccess: () => {
			queryClient.setQueryData(
				siteEdgeCacheLastClearedTimestampQuery( siteId ).queryKey,
				new Date().valueOf()
			);
		},
	} );

export const siteEdgeCacheStatusQuery = ( siteId: number ) =>
	queryOptions( {
		queryKey: [ 'site', siteId, 'edge-cache' ],
		queryFn: () => fetchEdgeCacheStatus( siteId ),
	} );

export const siteEdgeCacheStatusMutation = ( siteId: number ) =>
	mutationOptions( {
		meta: { statId: 'site-edge-cache-toggle' },
		mutationFn: ( active: boolean ) => updateEdgeCacheStatus( siteId, active ),
		onSuccess: ( active ) => {
			queryClient.setQueryData( siteEdgeCacheStatusQuery( siteId ).queryKey, active );
		},
	} );
