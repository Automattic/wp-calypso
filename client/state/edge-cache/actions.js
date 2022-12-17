import {
	EDGE_CACHE_ACTIVE_REQUEST,
	EDGE_CACHE_ACTIVE_SET_REQUEST,
	EDGE_CACHE_CACHE_PURGE,
} from 'calypso/state/action-types';

import 'calypso/state/data-layer/wpcom/sites/edge-cache/active';
import 'calypso/state/data-layer/wpcom/sites/edge-cache/cache-purge';
import 'calypso/state/edge-cache/init';

export const edgeCacheGetActive = ( siteId ) => ( {
	type: EDGE_CACHE_ACTIVE_REQUEST,
	siteId,
} );

export const edgeCacheSetActive = ( siteId, active ) => ( {
	type: EDGE_CACHE_ACTIVE_SET_REQUEST,
	siteId,
	active,
	meta: {
		dataLayer: {
			trackRequest: true,
			requestKey: `${ EDGE_CACHE_ACTIVE_SET_REQUEST }-${ siteId }`,
		},
	},
} );

export const edgeCachePurge = ( siteId ) => ( {
	type: EDGE_CACHE_CACHE_PURGE,
	siteId,
	meta: {
		dataLayer: {
			trackRequest: true,
			requestKey: `${ EDGE_CACHE_CACHE_PURGE }-${ siteId }`,
		},
	},
} );
