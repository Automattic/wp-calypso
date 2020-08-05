/**
 * Internal dependencies
 */
import { combineReducers, withStorageKey } from 'state/utils';
import lastNonEditorRoute from './last-non-editor-route/reducer';
import path from './path/reducer';
import query from './query/reducer';

const combinedReducer = combineReducers( {
	lastNonEditorRoute,
	path,
	query,
} );

const routeReducer = withStorageKey( 'route', combinedReducer );
export default routeReducer;
