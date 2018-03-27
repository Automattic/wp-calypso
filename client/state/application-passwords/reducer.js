/** @format */

/**
 * External dependencies
 */
import { reject } from 'lodash';

/**
 * Internal dependencies
 */
import {
	APPLICATION_PASSWORD_DELETE_SUCCESS,
	APPLICATION_PASSWORDS_RECEIVE,
} from 'state/action-types';

export default ( state = [], action ) => {
	switch ( action.type ) {
		case APPLICATION_PASSWORD_DELETE_SUCCESS:
			return reject( state, { ID: action.appPasswordId } );
		case APPLICATION_PASSWORDS_RECEIVE:
			return action.appPasswords;
		default:
			return state;
	}
};
