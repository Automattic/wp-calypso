/**
 * External dependencies
 */
import { AnyAction } from 'redux';

/**
 * Internal dependencies
 */
import {
	JETPACK_PARTNER_PORTAL_PARTNER_ACTIVE_PARTNER_KEY_UPDATE,
	JETPACK_PARTNER_PORTAL_PARTNER_REQUEST,
	JETPACK_PARTNER_PORTAL_PARTNER_REQUEST_FAILURE,
	JETPACK_PARTNER_PORTAL_PARTNER_REQUEST_SUCCESS,
} from 'calypso/state/action-types';
import { combineReducers, withoutPersistence, withSchemaValidation } from 'calypso/state/utils';

export const initialState = {
	hasFetched: false,
	isFetching: false,
	activePartnerKey: 0,
	current: null,
	error: '',
};

export const hasFetched = withoutPersistence(
	( state = initialState.isFetching, action: AnyAction ) => {
		switch ( action.type ) {
			case JETPACK_PARTNER_PORTAL_PARTNER_REQUEST_SUCCESS:
			case JETPACK_PARTNER_PORTAL_PARTNER_REQUEST_FAILURE:
				return true;
		}

		return state;
	}
);

export const isFetching = withoutPersistence(
	( state = initialState.isFetching, action: AnyAction ) => {
		switch ( action.type ) {
			case JETPACK_PARTNER_PORTAL_PARTNER_REQUEST:
				return true;

			case JETPACK_PARTNER_PORTAL_PARTNER_REQUEST_SUCCESS:
			case JETPACK_PARTNER_PORTAL_PARTNER_REQUEST_FAILURE:
				return false;
		}

		return state;
	}
);

export const activePartnerKey = withSchemaValidation(
	{
		type: 'number',
	},
	( state = initialState.activePartnerKey, action: AnyAction ) => {
		switch ( action.type ) {
			case JETPACK_PARTNER_PORTAL_PARTNER_ACTIVE_PARTNER_KEY_UPDATE:
				return action.partnerKeyId;
		}

		return state;
	}
);

export const current = withoutPersistence( ( state = initialState.current, action: AnyAction ) => {
	switch ( action.type ) {
		case JETPACK_PARTNER_PORTAL_PARTNER_REQUEST_SUCCESS:
			if ( action.partner.keys.length === 0 ) {
				// Ignore the partner if all of it does not have any keys or all of its keys are disabled.
				return null;
			}

			return action.partner;
	}

	return state;
} );

export const error = withoutPersistence( ( state = initialState.error, action: AnyAction ) => {
	switch ( action.type ) {
		case JETPACK_PARTNER_PORTAL_PARTNER_REQUEST_FAILURE:
			return `${ action.error.status }: ${ action.error.message }`;
	}

	return state;
} );

export default combineReducers( {
	hasFetched,
	isFetching,
	activePartnerKey,
	current,
	error,
} );
