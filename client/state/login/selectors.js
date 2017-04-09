/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Whether a login request is currently in process.
 *
 * @param  {Object}   state  Global state tree
 * @return {Boolean}         True if the login request is in process, false otherwise.
 */
export const isRequestingLogin = ( state ) => {
	return get( state, [ 'login', 'isRequesting' ], false );
};

/**
 * Whether the last login request was successful.
 *
 * @param  {Object}   state  Global state tree
 * @return {Boolean}         True if the login request was successful, false otherwise.
 */
export const isLoginSuccessful = ( state ) => {
	return get( state, [ 'login', 'requestSuccess' ], false );
};

/**
 * Retrieve the last login request error.
 * Returns null if there was no error at the last request.
 *
 * @param  {Object}   state  Global state tree
 * @return {?String}         The last login request error, null if none.
 */
export const getError = ( state ) => {
	return get( state, [ 'login', 'requestError' ], null );
};
