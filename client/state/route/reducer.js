/**
 * Internal dependencies
 */
import { combineReducers, withStorageKey } from 'state/utils';
import path from './path/reducer';
import query from './query/reducer';

const combinedReducer = combineReducers( {
	path,
	query,
} );

const routeReducer = withStorageKey( 'route', combinedReducer );
export default routeReducer;
