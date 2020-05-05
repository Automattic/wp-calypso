/**
 * Internal dependencies
 */
import {
	APPLICATION_PASSWORD_CREATE,
	APPLICATION_PASSWORD_CREATE_SUCCESS,
	APPLICATION_PASSWORD_DELETE,
	APPLICATION_PASSWORD_DELETE_SUCCESS,
	APPLICATION_PASSWORD_NEW_CLEAR,
	APPLICATION_PASSWORDS_RECEIVE,
	APPLICATION_PASSWORDS_REQUEST,
} from 'state/action-types';

import 'state/data-layer/wpcom/me/two-step/application-passwords';
import 'state/data-layer/wpcom/me/two-step/application-passwords/delete';
import 'state/data-layer/wpcom/me/two-step/application-passwords/new';

/**
 * Returns an action object to signal the request of the user's application passwords.
 *
 * @returns {object} Action object
 */
export const requestApplicationPasswords = () => ( { type: APPLICATION_PASSWORDS_REQUEST } );

/**
 * Returns an action object to signal the receiving of application passwords.
 *
 * @param  {Array}  appPasswords Array containing the application passwords of the current user.
 * @returns {object}              Action object.
 */
export const receiveApplicationPasswords = ( appPasswords ) => ( {
	type: APPLICATION_PASSWORDS_RECEIVE,
	appPasswords,
} );

/**
 * Returns an action object to signal the creation of an application password.
 *
 * @param  {string} applicationName Name of the application password.
 * @returns {object}                 Action object.
 */
export const createApplicationPassword = ( applicationName ) => ( {
	type: APPLICATION_PASSWORD_CREATE,
	applicationName,
} );

/**
 * Returns an action object to signal the successful creation of an application password.
 *
 * @param  {object} appPassword Application password.
 * @returns {object}             Action object.
 */
export const createApplicationPasswordSuccess = ( appPassword ) => ( {
	type: APPLICATION_PASSWORD_CREATE_SUCCESS,
	appPassword,
} );

/**
 * Returns an action object to signal the clearing of the new application password.
 *
 * @returns {object} Action object.
 */
export const clearNewApplicationPassword = () => ( {
	type: APPLICATION_PASSWORD_NEW_CLEAR,
} );

/**
 * Returns an action object to signal the deletion of an application password.
 *
 * @param  {number} appPasswordId ID of the application password.
 * @returns {object}               Action object.
 */
export const deleteApplicationPassword = ( appPasswordId ) => ( {
	type: APPLICATION_PASSWORD_DELETE,
	appPasswordId,
} );

/**
 * Returns an action object to signal the successful deletion of an application password.
 *
 * @param  {number} appPasswordId ID of the application password.
 * @returns {object}               Action object.
 */
export const deleteApplicationPasswordSuccess = ( appPasswordId ) => ( {
	type: APPLICATION_PASSWORD_DELETE_SUCCESS,
	appPasswordId,
} );
