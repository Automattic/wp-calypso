/**
 * Internal dependencies
 */
import { combineReducers, keyedReducer, withSchemaValidation } from 'state/utils';
import credentialsSchema from './schema';
import {
	JETPACK_CONNECT_AUTHORIZE_RECEIVE,
	JETPACK_ONBOARDING_CREDENTIALS_RECEIVE,
} from 'state/action-types';

const credentialsReducer = keyedReducer(
	'siteId',
	withSchemaValidation( credentialsSchema, ( state = {}, action ) => {
		switch ( action.type ) {
			case JETPACK_ONBOARDING_CREDENTIALS_RECEIVE: {
				const { credentials } = action;
				return credentials;
			}
			case JETPACK_CONNECT_AUTHORIZE_RECEIVE:
				return undefined;
		}

		return state;
	} )
);
credentialsReducer.hasCustomPersistence = true;

export { credentialsReducer as credentials };

export const reducer = combineReducers( {
	credentials: credentialsReducer,
} );
