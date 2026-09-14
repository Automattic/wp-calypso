import { ROUTE_SET } from 'calypso/state/action-types';
import { combineReducers } from 'calypso/state/utils';

export const currentClientId = ( state = null, action ) => {
	switch ( action.type ) {
		case ROUTE_SET: {
			const { path, query } = action;
			if (
				( path.startsWith( '/log-in' ) || path.startsWith( '/oauth2/authorize' ) ) &&
				query.client_id
			) {
				return Number( query.client_id );
			}

			if (
				path.startsWith( '/log-in/apple/callback' ) ||
				path.startsWith( '/start/wpcc' ) ||
				path.startsWith( '/start/crowdsignal' )
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
