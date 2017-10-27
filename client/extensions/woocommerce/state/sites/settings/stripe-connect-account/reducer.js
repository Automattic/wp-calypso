/**
 * External dependencies
 *
 * @format
 */

/**
 * Internal dependencies
 */
import { createReducer } from 'state/utils';
import {
	WOOCOMMERCE_SETTINGS_STRIPE_CONNECT_ACCOUNT_DETAILS_REQUEST,
	WOOCOMMERCE_SETTINGS_STRIPE_CONNECT_ACCOUNT_DETAILS_UPDATE,
	WOOCOMMERCE_SETTINGS_STRIPE_CONNECT_ACCOUNT_DISCONNECT,
	WOOCOMMERCE_SETTINGS_STRIPE_CONNECT_ACCOUNT_DISCONNECT_COMPLETE,
} from 'woocommerce/state/action-types';

/**
 * Updates state to indicate account creation request is in progress
 *
 * @param  {Object} state  Current state
 * @return {Object}        Updated state
 */
function connectAccountCreate( state = {} ) {
	return Object.assign( {}, state, {
		connectedUserID: '',
		displayName: '',
		email: '',
		firstName: '',
		isActivated: false,
		isDisconnecting: false,
		isRequesting: true,
		lastName: '',
		logo: '',
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
		isDisconnecting: false,
		isRequesting: false,
	} );
}

/**
 * Updates state to indicate account (details) fetch request is in progress
 *
 * @param  {Object} state  Current state
 * @return {Object}        Updated state
 */
function connectAccountFetch( state = {} ) {
	return Object.assign( {}, state, {
		connectedUserID: '',
		displayName: '',
		email: '',
		firstName: '',
		isActivated: false,
		isDisconnecting: false,
		isRequesting: true,
		lastName: '',
		logo: '',
	} );
}

/**
 * Updates state with fetched account details
 *
 * @param  {Object} state  Current state
 * @param  {Object} action Action payload
 * @return {Object}        Updated state
 */
function connectAccountFetchComplete( state = {}, action ) {
	return Object.assign( {}, state, {
		connectedUserID: action.connectedUserID || '',
		displayName: action.displayName || '',
		email: action.email || '',
		error: action.error || '',
		firstName: action.firstName || '',
		isActivated: action.isActivated || false,
		isDisconnecting: false,
		isRequesting: false,
		lastName: action.lastName || '',
		logo: action.logo || '',
	} );
}

/**
 * Updates state to indicate account disconnection request is in progress
 *
 * @param  {Object} state  Current state
 * @return {Object}        Updated state
 */
function connectAccountDisconnect( state = {} ) {
	return Object.assign( {}, state, {
		isDisconnecting: true,
	} );
}

/**
 * Updates state after disconnection completes
 *
 * @param  {Object} state  Current state
 * @param  {Object} action Action payload
 * @return {Object}        Updated state
 */
function connectAccountDisconnectComplete( state = {}, action ) {
	return Object.assign( {}, state, {
		connectedUserID: '',
		displayName: '',
		email: '',
		error: action.error || '',
		firstName: '',
		isActivated: false,
		isDisconnecting: false,
		isRequesting: false,
		lastName: '',
		logo: '',
	} );
}

export default createReducer( null, {
	[ WOOCOMMERCE_SETTINGS_STRIPE_CONNECT_ACCOUNT_DETAILS_REQUEST ]: connectAccountFetch,
	[ WOOCOMMERCE_SETTINGS_STRIPE_CONNECT_ACCOUNT_DETAILS_UPDATE ]: connectAccountFetchComplete,
	[ WOOCOMMERCE_SETTINGS_STRIPE_CONNECT_ACCOUNT_DISCONNECT ]: connectAccountDisconnect,
	[ WOOCOMMERCE_SETTINGS_STRIPE_CONNECT_ACCOUNT_DISCONNECT_COMPLETE ]: connectAccountDisconnectComplete,
} );
