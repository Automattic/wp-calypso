import { AnyAction } from 'redux';
import {
	JETPACK_PARTNER_PORTAL_OAUTH_TOKEN_SET,
	JETPACK_PARTNER_PORTAL_PARTNER_ACTIVE_PARTNER_KEY_UPDATE,
	JETPACK_PARTNER_PORTAL_PARTNER_REQUEST,
	JETPACK_PARTNER_PORTAL_PARTNER_RECEIVE,
	JETPACK_PARTNER_PORTAL_PARTNER_RECEIVE_ERROR,
	STORED_CARDS_UPDATE_IS_PRIMARY_COMPLETED,
} from 'calypso/state/action-types';
import { combineReducers, withSchemaValidation, withPersistence } from 'calypso/state/utils';
import { activePartnerKeySchema } from './schema';

export const initialState = {
	hasFetched: false,
	isFetching: false,
	activePartnerKey: 0,
	current: null,
	error: null,
};

export const hasFetched = ( state = initialState.isFetching, action: AnyAction ) => {
	switch ( action.type ) {
		case JETPACK_PARTNER_PORTAL_PARTNER_RECEIVE:
		case JETPACK_PARTNER_PORTAL_PARTNER_RECEIVE_ERROR:
			return true;
	}

	return state;
};

export const isFetching = ( state = initialState.isFetching, action: AnyAction ) => {
	switch ( action.type ) {
		case JETPACK_PARTNER_PORTAL_PARTNER_REQUEST:
			return true;

		case JETPACK_PARTNER_PORTAL_PARTNER_RECEIVE:
		case JETPACK_PARTNER_PORTAL_PARTNER_RECEIVE_ERROR:
			return false;
	}

	return state;
};

export const isPartnerOAuthTokenLoaded = ( state = false, action: AnyAction ) => {
	switch ( action.type ) {
		case JETPACK_PARTNER_PORTAL_OAUTH_TOKEN_SET:
			return true;
		default:
			return state;
	}
};

const activePartnerKeyReducer = ( state = initialState.activePartnerKey, action: AnyAction ) => {
	switch ( action.type ) {
		case JETPACK_PARTNER_PORTAL_PARTNER_ACTIVE_PARTNER_KEY_UPDATE:
			return action.partnerKeyId;
	}

	return state;
};

export const activePartnerKey = withSchemaValidation(
	activePartnerKeySchema,
	withPersistence( activePartnerKeyReducer )
);

const current = ( state = initialState.current, action: AnyAction ) => {
	switch ( action.type ) {
		case JETPACK_PARTNER_PORTAL_PARTNER_RECEIVE:
			if ( action.partner.keys.length === 0 ) {
				// Ignore the partner if all of it does not have any keys or all of its keys are disabled.
				return null;
			}

			return action.partner;

		case STORED_CARDS_UPDATE_IS_PRIMARY_COMPLETED:
			if ( null !== state ) {
				return Object.assign( state, {
					has_valid_payment_method: !! action?.payment_method_id,
				} );
			}

			return state;
	}

	return state;
};

export const error = ( state = initialState.error, action: AnyAction ) => {
	switch ( action.type ) {
		case JETPACK_PARTNER_PORTAL_PARTNER_RECEIVE_ERROR:
			return action.error;
	}

	return state;
};

export default combineReducers( {
	hasFetched,
	isFetching,
	isPartnerOAuthTokenLoaded,
	activePartnerKey,
	current,
	error,
} );
