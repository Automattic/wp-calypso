/**
 * Internal dependencies
 */
import {
	SECURE_YOUR_BRAND_REQUEST,
	SECURE_YOUR_BRAND_FAILURE,
	SECURE_YOUR_BRAND_SUCCESS,
} from 'calypso/state/action-types';
import { secureYourBrandSchema } from './schema';
import { combineReducers, withSchemaValidation, withStorageKey } from 'calypso/state/utils';

export const items = withSchemaValidation( secureYourBrandSchema, ( state = [], action ) => {
	switch ( action.type ) {
		case SECURE_YOUR_BRAND_SUCCESS:
			return Object.assign( {}, action.result );
	}
	return state;
} );

export const error = ( state = null, action ) => {
	switch ( action.type ) {
		case SECURE_YOUR_BRAND_REQUEST:
		case SECURE_YOUR_BRAND_SUCCESS:
			return null;

		case SECURE_YOUR_BRAND_FAILURE:
			return action.error;
	}

	return state;
};

export const requesting = ( state = false, action ) => {
	switch ( action.type ) {
		case SECURE_YOUR_BRAND_REQUEST:
		case SECURE_YOUR_BRAND_FAILURE:
		case SECURE_YOUR_BRAND_SUCCESS:
			return action.type === SECURE_YOUR_BRAND_REQUEST;
	}

	return state;
};

export default withStorageKey(
	'secure-your-brand',
	combineReducers( {
		items,
		requesting,
		error,
	} )
);
