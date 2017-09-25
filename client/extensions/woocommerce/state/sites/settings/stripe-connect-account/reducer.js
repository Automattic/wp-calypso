/**
 * Internal dependencies
 */
import { createReducer } from 'state/utils';
import { WOOCOMMERCE_SETTINGS_STRIPE_CONNECT_ACCOUNT_CREATE, WOOCOMMERCE_SETTINGS_STRIPE_CONNECT_ACCOUNT_CREATE_COMPLETE } from 'woocommerce/state/action-types';

/**
 * Updates state to indicate account creation request is in progress
 *
 * @param  {Object} state  Current state
 * @param  {Object} action Action payload
 * @return {Object}        Updated state
 */
function connectAccountCreate( state = {} ) {
	return Object.assign( {}, state, {
		connectedUserID: '',
		email: '',
		isActivated: false,
		isRequesting: true,
	} );
}

/**
 * Updates state with created account details
 *
 * @param  {Object} state  Current state
 * @param  {Object} action Action payload
 * @return {Object}        Updated state
 */
function connectAccountCreateComplete( state = {}, action ) {
	return Object.assign( {}, state, {
		connectedUserID: action.connectedUserID || '',
		email: action.email || '',
		error: action.error || '',
		isActivated: false,
		isRequesting: false,
	} );
}

export default createReducer( null, {
	[ WOOCOMMERCE_SETTINGS_STRIPE_CONNECT_ACCOUNT_CREATE ]: connectAccountCreate,
	[ WOOCOMMERCE_SETTINGS_STRIPE_CONNECT_ACCOUNT_CREATE_COMPLETE ]: connectAccountCreateComplete,
} );
