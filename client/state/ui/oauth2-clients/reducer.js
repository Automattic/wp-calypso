/** @format */

/**
 * External dependencies
 */

import { startsWith } from 'lodash';

/**
 * Internal dependencies
 */
import { combineReducers, createReducer } from 'state/utils';
import { ROUTE_SET } from 'state/action-types';

export const currentClientId = createReducer( null, {
	[ ROUTE_SET ]: ( state, { path, query } ) => {
		if ( startsWith( path, '/log-in' ) ) {
			return query.client_id ? Number( query.client_id ) : state;
		}

		if (
			startsWith( path, '/start/wpcc' ) ||
			startsWith( path, '/start/crowdsignal' )
		) {
			return query.oauth2_client_id ? Number( query.oauth2_client_id ) : state;
		}

		return state;
	},
} );

export default combineReducers( {
	currentClientId,
} );
