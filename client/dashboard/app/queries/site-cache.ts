import { mutationOptions, queryOptions } from '@tanstack/react-query';
import { clearObjectCache } from '../../data/site-hosting';
import {
	clearEdgeCache,
	fetchEdgeCacheStatus,
	updateEdgeCacheStatus,
} from '../../data/site-hosting-edge-cache';
import { queryClient } from '../query-client';

export const siteObjectCacheLastClearedTimestampQuery = ( siteId: number ) =>
	queryOptions( {
		queryKey: [ 'site', siteId, 'object-cache', 'last-cleared-timestamp' ],
		queryFn: () => Promise.resolve( 0 ),
		staleTime: Infinity,
	} );

export const siteObjectCacheClearMutation = ( siteId: number ) =>
	mutationOptions( {
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
		mutationFn: ( active: boolean ) => updateEdgeCacheStatus( siteId, active ),
		onSuccess: ( active ) => {
			queryClient.setQueryData( siteEdgeCacheStatusQuery( siteId ).queryKey, active );
		},
	} );
