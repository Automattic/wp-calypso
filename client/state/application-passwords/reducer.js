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
import { createReducer } from 'state/utils';

export default createReducer( [], {
	[ APPLICATION_PASSWORD_DELETE_SUCCESS ]: ( state, { appPasswordId } ) =>
		reject( state, { ID: appPasswordId } ),
	[ APPLICATION_PASSWORDS_RECEIVE ]: ( state, { appPasswords } ) => appPasswords,
} );
