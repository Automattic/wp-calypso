/**
 * Internal dependencies
 */
import { combineReducers, withSchemaValidation, withStorageKey } from 'calypso/state/utils';
import lastNonEditorRoute from './last-non-editor-route/reducer';
import schema from './last-non-editor-route/schema';
import path from './path/reducer';
import query from './query/reducer';

const combinedReducer = combineReducers( {
	lastNonEditorRoute: withSchemaValidation( schema, lastNonEditorRoute ),
	path,
	query,
} );

const routeReducer = withStorageKey( 'route', combinedReducer );
export default routeReducer;
