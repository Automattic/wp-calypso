import { clearObjectCache } from '../../data/site-hosting';
import {
	clearEdgeCache,
	fetchEdgeCacheStatus,
	updateEdgeCacheStatus,
} from '../../data/site-hosting-edge-cache';
import { queryClient } from '../query-client';

export const siteObjectCacheLastClearedTimestampQuery = ( siteId: number ) => ( {
	queryKey: [ 'site', siteId, 'object-cache', 'last-cleared-timestamp' ],
	queryFn: () => Promise.resolve( 0 ),
	staleTime: Infinity,
} );

export const siteObjectCacheClearMutation = ( siteId: number ) => ( {
	mutationFn: ( reason: string ) => clearObjectCache( siteId, reason ),
	onSuccess: () => {
		queryClient.setQueryData(
			siteObjectCacheLastClearedTimestampQuery( siteId ).queryKey,
			new Date().valueOf()
		);
	},
} );

export const siteEdgeCacheLastClearedTimestampQuery = ( siteId: number ) => ( {
	queryKey: [ 'site', siteId, 'edge-cache', 'last-cleared-timestamp' ],
	queryFn: () => Promise.resolve( 0 ),
	staleTime: Infinity,
} );

export const siteEdgeCacheClearMutation = ( siteId: number ) => ( {
	mutationFn: () => clearEdgeCache( siteId ),
	onSuccess: () => {
		queryClient.setQueryData(
			siteEdgeCacheLastClearedTimestampQuery( siteId ).queryKey,
			new Date().valueOf()
		);
	},
} );

export const siteEdgeCacheStatusQuery = ( siteId: number ) => ( {
	queryKey: [ 'site', siteId, 'edge-cache' ],
	queryFn: () => fetchEdgeCacheStatus( siteId ),
} );

export const siteEdgeCacheStatusMutation = ( siteId: number ) => ( {
	mutationFn: ( active: boolean ) => updateEdgeCacheStatus( siteId, active ),
	onSuccess: ( active: boolean ) => {
		queryClient.setQueryData( siteEdgeCacheStatusQuery( siteId ).queryKey, active );
	},
} );
