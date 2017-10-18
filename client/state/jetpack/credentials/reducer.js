/**
 * External dependencies
 */
import { stubFalse, stubTrue } from 'lodash';

/**
 * Internal dependencies
 */
import {
	JETPACK_CREDENTIALS_AUTOCONFIGURE,
	JETPACK_CREDENTIALS_AUTOCONFIGURE_FAILURE,
	JETPACK_CREDENTIALS_AUTOCONFIGURE_SUCCESS,
	JETPACK_CREDENTIALS_REQUEST,
	JETPACK_CREDENTIALS_STORE,
	JETPACK_CREDENTIALS_UPDATE,
	JETPACK_CREDENTIALS_UPDATE_SUCCESS,
	JETPACK_CREDENTIALS_UPDATE_FAILURE
} from 'state/action-types';
import {
	combineReducers,
	createReducer
} from 'state/utils';
import { itemsSchema } from './schema';

export const items = ( state = {}, action ) => {
	if ( JETPACK_CREDENTIALS_STORE === action.type ) {
		const credentials = 'object' === typeof action.credentials.credentials
			? action.credentials.credentials
			: {};

		return credentials;
	}

	return state;
};
items.schema = itemsSchema;

export const requesting = ( state = false, action ) => {
	switch ( action.type ) {
		case JETPACK_CREDENTIALS_REQUEST:
			return true;
		case JETPACK_CREDENTIALS_STORE:
			return false;
	}

	return state;
};

export const updateRequesting = createReducer(
	false,
	{
		[ JETPACK_CREDENTIALS_UPDATE ]: stubTrue,
		[ JETPACK_CREDENTIALS_UPDATE_SUCCESS ]: stubFalse,
		[ JETPACK_CREDENTIALS_UPDATE_FAILURE ]: stubFalse,
	}
);

export const updateSuccess = createReducer(
	false,
	{
		[ JETPACK_CREDENTIALS_UPDATE ]: stubFalse,
		[ JETPACK_CREDENTIALS_UPDATE_SUCCESS ]: stubTrue,
		[ JETPACK_CREDENTIALS_UPDATE_FAILURE ]: stubFalse
	}
);

export const updateFailed = createReducer(
	false,
	{
		[ JETPACK_CREDENTIALS_UPDATE ]: stubFalse,
		[ JETPACK_CREDENTIALS_UPDATE_SUCCESS ]: stubFalse,
		[ JETPACK_CREDENTIALS_UPDATE_FAILURE ]: stubTrue,
	}
);

export const autoConfigRequesting = createReducer(
	false,
	{
		[ JETPACK_CREDENTIALS_AUTOCONFIGURE ]: stubTrue,
		[ JETPACK_CREDENTIALS_AUTOCONFIGURE_FAILURE ]: stubFalse,
		[ JETPACK_CREDENTIALS_AUTOCONFIGURE_SUCCESS ]: stubFalse,
	}
);

export const autoConfigSuccess = createReducer(
	false,
	{
		[ JETPACK_CREDENTIALS_AUTOCONFIGURE ]: stubFalse,
		[ JETPACK_CREDENTIALS_AUTOCONFIGURE_FAILURE ]: stubFalse,
		[ JETPACK_CREDENTIALS_AUTOCONFIGURE_SUCCESS ]: stubTrue,
	}
);

export const autoConfigFailed = createReducer(
	false,
	{
		[ JETPACK_CREDENTIALS_AUTOCONFIGURE ]: stubFalse,
		[ JETPACK_CREDENTIALS_AUTOCONFIGURE_FAILURE ]: stubTrue,
		[ JETPACK_CREDENTIALS_AUTOCONFIGURE_SUCCESS ]: stubFalse,
	}
);

export const reducer = combineReducers( {
	autoConfigFailed,
	autoConfigRequesting,
	autoConfigSuccess,
	items,
	requesting,
	updateFailed,
	updateRequesting,
	updateSuccess,
} );
