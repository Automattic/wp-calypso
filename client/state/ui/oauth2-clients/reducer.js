/**
 * External dependencies
 */
import { startsWith } from 'lodash';

/**
 * Internal dependencies
 */
import { ROUTE_SET } from 'state/action-types';
import { combineReducers, createReducer } from 'state/utils';

export const currentClientId = createReducer( null, {
	[ ROUTE_SET ]: ( state, { path, query } ) => {
		if ( startsWith( path, '/log-in' ) ) {
			return query.client_id || state;
		}

		if ( startsWith( path, '/start/wpcc' ) ) {
			return query.oauth2_client_id || state;
		}

		return state;
	}
} );

export default combineReducers( {
	currentClientId,
} );
