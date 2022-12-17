import { withStorageKey } from '@automattic/state-utils';
import { EDGE_CACHE_ACTIVE_SET, EDGE_CACHE_CACHE_PURGE } from 'calypso/state/action-types';
import {
	combineReducers,
	keyedReducer,
	withPersistence,
	withSchemaValidation,
} from 'calypso/state/utils';

// eslint-disable-next-line no-shadow
const active = ( state = null, { type, active } ) => {
	switch ( type ) {
		case EDGE_CACHE_ACTIVE_SET:
			return active;
	}

	return state;
};

export const lastCachePurgeTimestamp = withSchemaValidation(
	{ type: 'integer' },
	withPersistence( ( state = null, { type } ) => {
		switch ( type ) {
			case EDGE_CACHE_CACHE_PURGE:
				return new Date().valueOf();
		}

		return state;
	} )
);

const edgeCacheReducer = combineReducers( {
	active,
	lastCachePurgeTimestamp,
} );

const reducer = keyedReducer( 'siteId', edgeCacheReducer );
export default withStorageKey( 'edgeCache', reducer );
