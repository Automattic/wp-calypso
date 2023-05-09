import { startsWith } from 'lodash';
import { ROUTE_SET } from 'calypso/state/action-types';
import { combineReducers } from 'calypso/state/utils';

export const currentClientId = ( state = null, action ) => {
	switch ( action.type ) {
		case ROUTE_SET: {
			const { path, query } = action;
			if ( startsWith( path, '/log-in' ) && query.client_id ) {
				return Number( query.client_id );
			}

			if (
				startsWith( path, '/log-in/apple/callback' ) ||
				startsWith( path, '/start/wpcc' ) ||
				startsWith( path, '/start/crowdsignal' )
			) {
				return query.oauth2_client_id ? Number( query.oauth2_client_id ) : state;
			}

			return state;
		}
	}

	return state;
};

export default combineReducers( {
	currentClientId,
} );
