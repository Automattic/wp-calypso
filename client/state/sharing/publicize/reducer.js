import { omit } from '@automattic/js-utils';
import {
	PUBLICIZE_CONNECTION_CREATE,
	PUBLICIZE_CONNECTION_DELETE,
	PUBLICIZE_CONNECTION_RECEIVE,
	PUBLICIZE_CONNECTION_UPDATE,
} from 'calypso/state/action-types';
import { combineReducers, withSchemaValidation } from 'calypso/state/utils';
import { connectionsSchema } from './schema';

// Tracks all known connection objects, indexed by connection ID.
export const connections = withSchemaValidation( connectionsSchema, ( state = {}, action ) => {
	switch ( action.type ) {
		case PUBLICIZE_CONNECTION_CREATE: {
			const { connection } = action;

			return {
				...state,
				[ connection.ID ]: connection,
			};
		}
		case PUBLICIZE_CONNECTION_DELETE: {
			const {
				connection: { ID },
			} = action;
			return omit( state, ID );
		}
		case PUBLICIZE_CONNECTION_RECEIVE: {
			const { connection } = action;

			return {
				...state,
				[ connection.ID ]: connection,
			};
		}
		case PUBLICIZE_CONNECTION_UPDATE: {
			const { connection } = action;

			return {
				...state,
				[ connection.ID ]: connection,
			};
		}
	}

	return state;
} );

export default combineReducers( {
	connections,
} );
