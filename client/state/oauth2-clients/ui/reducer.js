import { startsWith } from 'lodash';
import { ROUTE_SET } from 'calypso/state/action-types';
import { combineReducers } from 'calypso/state/utils';

export const currentClientId = ( state = null, action ) => {
	switch ( action.type ) {
		case ROUTE_SET: {
			const { path, query } = action;
			if ( startsWith( path, '/log-in' ) ) {
				return query.client_id ? Number( query.client_id ) : state;
			}

			if ( startsWith( path, '/start/wpcc' ) || startsWith( path, '/start/crowdsignal' ) ) {
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
