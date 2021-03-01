/**
 * Internal dependencies
 */
import {
	CONNECTED_APPLICATION_DELETE,
	CONNECTED_APPLICATION_DELETE_SUCCESS,
	CONNECTED_APPLICATIONS_RECEIVE,
	CONNECTED_APPLICATIONS_REQUEST,
} from 'calypso/state/action-types';

import 'calypso/state/data-layer/wpcom/me/connected-applications';
import 'calypso/state/data-layer/wpcom/me/connected-applications/delete';
import 'calypso/state/connected-applications/init';

/**
 * Returns an action object to signal the request of the user's connected applications.
 *
 * @returns {object} Action object
 */
export const requestConnectedApplications = () => ( {
	type: CONNECTED_APPLICATIONS_REQUEST,
} );

/**
 * Returns an action object to signal the receiving of connected applications.
 *
 * @param  {Array}  apps Array containing the connected applications of the current user.
 * @returns {object} Action object.
 */
export const receiveConnectedApplications = ( apps ) => ( {
	type: CONNECTED_APPLICATIONS_RECEIVE,
	apps,
} );

/**
 * Returns an action object to signal the deletion of a connected application.
 *
 * @param  {string} appId ID of the connected application.
 * @returns {object} Action object.
 */
export const deleteConnectedApplication = ( appId ) => ( {
	type: CONNECTED_APPLICATION_DELETE,
	appId,
} );

/**
 * Returns an action object to signal the successful deletion of a connected application.
 *
 * @param  {string} appId ID of the connected application.
 * @returns {object} Action object.
 */
export const deleteConnectedApplicationSuccess = ( appId ) => ( {
	type: CONNECTED_APPLICATION_DELETE_SUCCESS,
	appId,
} );
