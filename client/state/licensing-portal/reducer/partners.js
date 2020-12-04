/**
 * Internal dependencies
 */
import {
	JETPACK_LICENSING_PORTAL_PARTNERS_ACTIVE_PARTNER_KEY_UPDATE,
	JETPACK_LICENSING_PORTAL_PARTNERS_ALL_REQUEST,
	JETPACK_LICENSING_PORTAL_PARTNERS_ALL_REQUEST_FAILURE,
	JETPACK_LICENSING_PORTAL_PARTNERS_ALL_REQUEST_SUCCESS,
} from 'calypso/state/action-types';
import { combineReducers, withoutPersistence, withSchemaValidation } from 'calypso/state/utils';
import filter from 'lodash/filter';

export const initialState = {
	isFetching: false,
	activePartnerKey: 0,
	all: [],
	error: '',
};

export const isFetching = withoutPersistence( ( state = initialState.isFetching, action ) => {
	switch ( action.type ) {
		case JETPACK_LICENSING_PORTAL_PARTNERS_ALL_REQUEST:
			return true;

		case JETPACK_LICENSING_PORTAL_PARTNERS_ALL_REQUEST_SUCCESS:
		case JETPACK_LICENSING_PORTAL_PARTNERS_ALL_REQUEST_FAILURE:
			return false;
	}

	return state;
} );

export const activePartnerKey = withSchemaValidation(
	{
		type: 'number',
	},
	( state = initialState.activePartnerKey, action ) => {
		switch ( action.type ) {
			case JETPACK_LICENSING_PORTAL_PARTNERS_ACTIVE_PARTNER_KEY_UPDATE:
				return action.partnerKeyId;
		}

		return state;
	}
);

export const all = withoutPersistence( ( state = initialState.all, action ) => {
	switch ( action.type ) {
		case JETPACK_LICENSING_PORTAL_PARTNERS_ALL_REQUEST_SUCCESS:
			// Only store the partners with keys that are not disabled.
			return filter( action.partners, ( partner ) => {
				// Strip out disabled keys.
				partner.keys = filter( partner.keys, ( key ) => key.disabled_on === null );
				return partner.keys.length > 0;
			} );
	}

	return state;
} );

export const error = withoutPersistence( ( state = initialState.error, action ) => {
	switch ( action.type ) {
		case JETPACK_LICENSING_PORTAL_PARTNERS_ALL_REQUEST_FAILURE:
			return `${ action.error.status }: ${ action.error.message }`;
	}

	return state;
} );

export default combineReducers( {
	isFetching,
	activePartnerKey,
	all,
	error,
} );
