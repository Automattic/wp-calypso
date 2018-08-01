/** @format */

/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Retrieves the information whether or not immediate login link
 * was used to arrive at the current instance of Calypso
 *
 * @param  {Object}   state  Global state tree
 * @return {?bool}    		   Arrived by immediate login link or not
 */
export const wasImmediateLoginUsed = state => {
	return get( state, 'immediateLogin.used', false );
};

/**
 * Retrieves the reason information provided in the query parameters of
 * immediate login redirect page.
 *
 * @param  {Object}   state  Global state tree
 * @return {?String}         Reason for immediate login
 */
export const getImmediateLoginReason = state => {
	return get( state, 'immediateLogin.reason', null );
};
