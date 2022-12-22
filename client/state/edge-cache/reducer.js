import { withStorageKey } from '@automattic/state-utils';
import { EDGE_CACHE_ACTIVE_SET } from 'calypso/state/action-types';
import { combineReducers, keyedReducer } from 'calypso/state/utils';

const active = ( state = null, { type, active: active_value } ) => {
	switch ( type ) {
		case EDGE_CACHE_ACTIVE_SET:
			return active_value;
	}

	return state;
};

const edgeCacheReducer = combineReducers( {
	active,
} );

const reducer = keyedReducer( 'siteId', edgeCacheReducer );
export default withStorageKey( 'edgeCache', reducer );
