import { withStorageKey } from '@automattic/state-utils';
import { ROUTE_SET } from 'calypso/state/action-types';
import { combineReducers } from 'calypso/state/utils';
import path from './path/reducer';
import query from './query/reducer';

function timestamp( state = null, action ) {
	switch ( action.type ) {
		case ROUTE_SET:
			return Date.now();
		default:
			return state;
	}
}

const combinedReducer = combineReducers( {
	path,
	query,
	timestamp,
} );

const routeReducer = withStorageKey( 'route', combinedReducer );
export default routeReducer;
