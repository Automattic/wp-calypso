import { withStorageKey } from '@automattic/state-utils';
import {
	EMAIL_FORWARDING_REQUEST,
	EMAIL_FORWARDING_REQUEST_SUCCESS,
	EMAIL_FORWARDING_REQUEST_FAILURE,
} from 'calypso/state/action-types';
import { combineReducers, keyedReducer, withSchemaValidation } from 'calypso/state/utils';
import { forwardsSchema, mxSchema, typeSchema } from './schema';

export const requestingReducer = ( state = false, action ) => {
	switch ( action.type ) {
		case EMAIL_FORWARDING_REQUEST:
			return true;
		case EMAIL_FORWARDING_REQUEST_SUCCESS:
			return false;
		case EMAIL_FORWARDING_REQUEST_FAILURE:
			return false;
	}

	return state;
};

export const typeReducer = withSchemaValidation( typeSchema, ( state = null, action ) => {
	switch ( action.type ) {
		case EMAIL_FORWARDING_REQUEST:
			return null;
		case EMAIL_FORWARDING_REQUEST_FAILURE:
			return null;
		case EMAIL_FORWARDING_REQUEST_SUCCESS: {
			const {
				response: { type },
			} = action;
			return type || null;
		}
	}

	return state;
} );

export const mxServersReducer = withSchemaValidation( mxSchema, ( state = null, action ) => {
	switch ( action.type ) {
		case EMAIL_FORWARDING_REQUEST:
			return null;
		case EMAIL_FORWARDING_REQUEST_FAILURE:
			return null;
		case EMAIL_FORWARDING_REQUEST_SUCCESS: {
			const {
				response: { mx_servers },
			} = action;
			return mx_servers || [];
		}
	}

	return state;
} );

export const forwardsReducer = withSchemaValidation( forwardsSchema, ( state = null, action ) => {
	switch ( action.type ) {
		case EMAIL_FORWARDING_REQUEST:
			return null;
		case EMAIL_FORWARDING_REQUEST_FAILURE:
			return null;
		case EMAIL_FORWARDING_REQUEST_SUCCESS: {
			const {
				response: { forwards },
			} = action;
			return forwards || [];
		}
	}

	return state;
} );

export const requestErrorReducer = ( state = false, action ) => {
	switch ( action.type ) {
		case EMAIL_FORWARDING_REQUEST:
			return false;
		case EMAIL_FORWARDING_REQUEST_SUCCESS:
			return false;
		case EMAIL_FORWARDING_REQUEST_FAILURE: {
			const {
				error: { message },
			} = action;
			return message || true;
		}
	}

	return state;
};

const combinedReducer = keyedReducer(
	'domainName',
	combineReducers( {
		forwards: forwardsReducer,
		mxServers: mxServersReducer,
		requesting: requestingReducer,
		requestError: requestErrorReducer,
		type: typeReducer,
	} )
);

export default withStorageKey( 'emailForwarding', combinedReducer );
