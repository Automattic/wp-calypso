/**
 * External dependencies
 */
import { combineReducers } from 'redux';

/**
 * Internal dependencies
 */
import { createReducer } from 'state/utils';

import {
	SITE_UPDATES_RECEIVE,
	SITE_UPDATES_REQUEST,
	SITE_UPDATES_REQUEST_SUCCESS,
	SITE_UPDATES_REQUEST_FAILURE,
	SERIALIZE,
	DESERIALIZE
} from 'state/action-types';

import { itemsSchema } from './schema';

export const items = createReducer(
	{},
	{ [ SITE_UPDATES_RECEIVE ]: ( state, { siteId, updates } ) => Object.assign( {}, state, { [ siteId ]: updates } ) },
	itemsSchema
);

export const requesting = ( state = false, { type } ) => {
	switch ( type ) {
		case SITE_UPDATES_REQUEST:
		case SITE_UPDATES_REQUEST_SUCCESS:
		case SITE_UPDATES_REQUEST_FAILURE:
			return type === SITE_UPDATES_REQUEST;

		case SERIALIZE:
		case DESERIALIZE:
			return false;
	}

	return state;
};

export const errors = ( state = false, { type } ) => {
	switch ( type ) {
		case SITE_UPDATES_REQUEST:
		case SITE_UPDATES_REQUEST_SUCCESS:
			return false;

		case SITE_UPDATES_REQUEST_FAILURE:
			return true;

		case SERIALIZE:
		case DESERIALIZE:
			return false;
	}

	return state;
};

export default combineReducers( {
	items,
	requesting,
	errors
} );
