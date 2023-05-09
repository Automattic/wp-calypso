import { withStorageKey } from '@automattic/state-utils';
import { ROUTE_SET } from 'calypso/state/action-types';
import { combineReducers, withSchemaValidation } from 'calypso/state/utils';
import lastNonEditorRoute from './last-non-editor-route/reducer';
import schema from './last-non-editor-route/schema';
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
	lastNonEditorRoute: withSchemaValidation( schema, lastNonEditorRoute ),
	path,
	query,
	timestamp,
} );

const routeReducer = withStorageKey( 'route', combinedReducer );
export default routeReducer;
