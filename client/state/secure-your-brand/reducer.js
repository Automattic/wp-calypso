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
			return Object.assign( {}, action.secureYourBrand );
	}
	return state;
} );

export const error = ( state = false, action ) => {
	switch ( action.type ) {
		case SECURE_YOUR_BRAND_REQUEST:
		case SECURE_YOUR_BRAND_SUCCESS:
			return false;
		case SECURE_YOUR_BRAND_FAILURE:
			return true;
	}

	return state;
};

export const requesting = ( state = false, action ) => {
	switch ( action.type ) {
		case SECURE_YOUR_BRAND_REQUEST:
			return true;
		case SECURE_YOUR_BRAND_FAILURE:
		case SECURE_YOUR_BRAND_SUCCESS:
			return false;
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
