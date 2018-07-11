/** @format */

/**
 * External dependencies
 */
import { translate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { APPLICATION_PASSWORD_DELETE } from 'state/action-types';
import { deleteApplicationPasswordSuccess } from 'state/application-passwords/actions';
import { dispatchRequestEx } from 'state/data-layer/wpcom-http/utils';
import { errorNotice } from 'state/notices/actions';
import { http } from 'state/data-layer/wpcom-http/actions';

/**
 * Dispatches a request to delete an application password for the current user
 *
 * @param   {Object} action Redux action
 * @returns {Object} Dispatched http action
 */
export const removeApplicationPassword = action =>
	http(
		{
			apiVersion: '1.1',
			method: 'POST',
			path: '/me/two-step/application-passwords/' + action.appPasswordId + '/delete',
		},
		action
	);

/**
 * Dispatches a user application password removal success action when the request succeeded.
 *
 * @param   {Object} action Redux action
 * @returns {Object} Dispatched user application passwords add action
 */
export const handleRemoveSuccess = ( { appPasswordId } ) =>
	deleteApplicationPasswordSuccess( appPasswordId );

/**
 * Dispatches an error notice when the request failed.
 *
 * @returns {Object} Dispatched error notice action
 */
export const handleRemoveError = () =>
	errorNotice(
		translate( 'The application password was not successfully deleted. Please try again.' ),
		{
			duration: 8000,
		}
	);

export default {
	[ APPLICATION_PASSWORD_DELETE ]: [
		dispatchRequestEx( {
			fetch: removeApplicationPassword,
			onSuccess: handleRemoveSuccess,
			onError: handleRemoveError,
		} ),
	],
};
