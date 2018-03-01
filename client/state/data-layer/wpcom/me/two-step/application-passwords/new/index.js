/** @format */

/**
 * External dependencies
 */
import { translate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { APPLICATION_PASSWORD_CREATE } from 'state/action-types';
import { dispatchRequestEx } from 'state/data-layer/wpcom-http/utils';
import { errorNotice } from 'state/notices/actions';
import { http } from 'state/data-layer/wpcom-http/actions';
import { requestApplicationPasswords } from 'state/application-passwords/actions';

/**
 * Dispatches a request to add an application password for the current user
 *
 * @param   {Object} action Redux action
 * @returns {Object} Dispatched http action
 */
export const addApplicationPassword = action =>
	http(
		{
			apiVersion: '1.1',
			method: 'POST',
			path: '/me/two-step/application-passwords/new',
			body: {
				application_name: action.applicationName,
			},
		},
		action
	);

/**
 * Dispatches a user application passwords receive action when the request succeeded.
 * Necessary because we want to refetch the app passwords after creating a new one.
 *
 * @param   {Object} action Redux action
 * @param   {Array}  data   Response from the endpoint
 * @returns {Object} Dispatched application passwords request action
 */
export const handleAddSuccess = () => requestApplicationPasswords();

/**
 * Dispatches an error notice when the request failed.
 *
 * @returns {Object} Dispatched error notice action
 */
export const handleAddError = () =>
	errorNotice(
		translate( 'There was a problem creating your application password. Please try again.' ),
		{
			duration: 8000,
		}
	);

export default {
	[ APPLICATION_PASSWORD_CREATE ]: [
		dispatchRequestEx( {
			fetch: addApplicationPassword,
			onSuccess: handleAddSuccess,
			onError: handleAddError,
		} ),
	],
};
