/** @format */

/**
 * Internal dependencies
 */
import {
	APPLICATION_PASSWORD_CREATE,
	APPLICATION_PASSWORD_DELETE,
	APPLICATION_PASSWORD_DELETE_SUCCESS,
	APPLICATION_PASSWORDS_RECEIVE,
	APPLICATION_PASSWORDS_REQUEST,
} from 'state/action-types';

/**
 * Returns an action object to signal the request of the user's application passwords.
 *
 * @returns {Object} Action object
 */
export const requestApplicationPasswords = () => ( { type: APPLICATION_PASSWORDS_REQUEST } );

/**
 * Returns an action object to signal the receiving of application passwords.
 *
 * @param  {Array}  appPasswords Array containing the application passwords of the current user.
 * @return {Object}              Action object.
 */
export const receiveApplicationPasswords = appPasswords => ( {
	type: APPLICATION_PASSWORDS_RECEIVE,
	appPasswords,
} );

/**
 * Returns an action object to signal the creation of an application password.
 *
 * @param  {String} applicationName Name of the application password.
 * @return {Object}                 Action object.
 */
export const createApplicationPassword = applicationName => ( {
	type: APPLICATION_PASSWORD_CREATE,
	applicationName,
} );

/**
 * Returns an action object to signal the deletion of an application password.
 *
 * @param  {Number} appPasswordId ID of the application password.
 * @return {Object}               Action object.
 */
export const deleteApplicationPassword = appPasswordId => ( {
	type: APPLICATION_PASSWORD_DELETE,
	appPasswordId,
} );

/**
 * Returns an action object to signal the successful deletion of an application password.
 *
 * @param  {Number} appPasswordId ID of the application password.
 * @return {Object}               Action object.
 */
export const deleteApplicationPasswordSuccess = appPasswordId => ( {
	type: APPLICATION_PASSWORD_DELETE_SUCCESS,
	appPasswordId,
} );
