/**
 * Internal dependencies
 */
import { createReducer } from 'state/utils';
import {
	WOOCOMMERCE_SETTINGS_STRIPE_CONNECT_ACCOUNT_CREATE_ERROR,
	WOOCOMMERCE_SETTINGS_STRIPE_CONNECT_ACCOUNT_CREATE_REQUEST,
	WOOCOMMERCE_SETTINGS_STRIPE_CONNECT_ACCOUNT_CREATE_SUCCESS
} from 'woocommerce/state/action-types';

/**
 * Updates state to indicate account creation request is in progress
 *
 * @param  {Object} state  Current state
 * @param  {Object} action Action payload
 * @return {Object}        Updated state
 */
function requestingAccountCreation( state = {} ) {
	return Object.assign( {}, state, {
		connectedUserID: '',
		email: '',
		isActivated: false,
		isRequesting: true,
	} );
}

/**
 * Updates state with successfully created account details
 *
 * @param  {Object} state  Current state
 * @param  {Object} action Action payload
 * @return {Object}        Updated state
 */
function receivingAccountCreated( state = {}, action ) {
	if ( action.connectedUserID ) {
		return Object.assign( {}, state, {
			connectedUserID: action.connectedUserID,
			email: action.email,
			isActivated: false,
			isRequesting: false,
		} );
	}

	return state;
}

/**
 * Updates state when account creation fails
 *
 * @param  {Object} state  Current state
 * @param  {Object} action Action payload
 * @return {Object}        Updated state
 */
function receivingAccountCreationError( state = {} ) {
	return Object.assign( {}, state, {
		connectedUserID: '',
		email: '',
		isActivated: false,
		isRequesting: false,
	} );
}

export default createReducer( null, {
	[ WOOCOMMERCE_SETTINGS_STRIPE_CONNECT_ACCOUNT_CREATE_REQUEST ]: requestingAccountCreation,
	[ WOOCOMMERCE_SETTINGS_STRIPE_CONNECT_ACCOUNT_CREATE_SUCCESS ]: receivingAccountCreated,
	[ WOOCOMMERCE_SETTINGS_STRIPE_CONNECT_ACCOUNT_CREATE_ERROR ]: receivingAccountCreationError,
} );
