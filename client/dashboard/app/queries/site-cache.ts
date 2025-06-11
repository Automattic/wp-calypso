import { clearObjectCache } from '../../data/site-hosting';
import {
	clearEdgeCache,
	fetchEdgeCacheStatus,
	updateEdgeCacheStatus,
} from '../../data/site-hosting-edge-cache';
import { queryClient } from '../query-client';

export const siteObjectCacheClearMutation = ( siteId: string ) => ( {
	mutationFn: ( reason: string ) => clearObjectCache( siteId, reason ),
} );

export const siteEdgeCacheClearMutation = ( siteId: string ) => ( {
	mutationFn: () => clearEdgeCache( siteId ),
} );

export const siteEdgeCacheStatusQuery = ( siteId: string ) => ( {
	queryKey: [ 'site', siteId, 'edge-cache' ],
	queryFn: () => fetchEdgeCacheStatus( siteId ),
} );

export const siteEdgeCacheStatusMutation = ( siteId: string ) => ( {
	mutationFn: ( active: boolean ) => updateEdgeCacheStatus( siteId, active ),
	onSuccess: ( active: boolean ) => {
		queryClient.setQueryData( siteEdgeCacheStatusQuery( siteId ).queryKey, active );
	},
} );
