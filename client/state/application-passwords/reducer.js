/** @format */

/**
 * External dependencies
 */
import { reject } from 'lodash';

/**
 * Internal dependencies
 */
import {
	APPLICATION_PASSWORD_CREATE_SUCCESS,
	APPLICATION_PASSWORD_DELETE_SUCCESS,
	APPLICATION_PASSWORD_NEW_CLEAR,
	APPLICATION_PASSWORDS_RECEIVE,
} from 'state/action-types';
import { combineReducers } from 'state/utils';
import { itemsSchema } from './schema';

export const items = ( state = [], action ) => {
	switch ( action.type ) {
		case APPLICATION_PASSWORD_DELETE_SUCCESS:
			return reject( state, { ID: action.appPasswordId } );
		case APPLICATION_PASSWORDS_RECEIVE:
			return action.appPasswords;
		default:
			return state;
	}
};
items.schema = itemsSchema;

export const newPassword = ( state = null, action ) => {
	switch ( action.type ) {
		case APPLICATION_PASSWORD_CREATE_SUCCESS:
			return action.appPassword;
		case APPLICATION_PASSWORD_NEW_CLEAR:
			return null;
		default:
			return state;
	}
};

export default combineReducers( {
	items,
	newPassword,
} );
