/**
 * External dependencies
 */
import { translate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { APPLICATION_PASSWORD_DELETE } from 'state/action-types';
import { deleteApplicationPasswordSuccess } from 'state/application-passwords/actions';
import { dispatchRequest } from 'state/data-layer/wpcom-http/utils';
import { errorNotice } from 'state/notices/actions';
import { http } from 'state/data-layer/wpcom-http/actions';

import { registerHandlers } from 'state/data-layer/handler-registry';

/**
 * Dispatches a request to delete an application password for the current user
 *
 * @param   {object} action Redux action
 * @returns {object} Dispatched http action
 */
export const removeApplicationPassword = ( action ) =>
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
 * @param   {object} action Redux action
 * @returns {object} Dispatched user application passwords add action
 */
export const handleRemoveSuccess = ( { appPasswordId } ) =>
	deleteApplicationPasswordSuccess( appPasswordId );

/**
 * Dispatches an error notice when the request failed.
 *
 * @returns {object} Dispatched error notice action
 */
export const handleRemoveError = () =>
	errorNotice(
		translate( 'The application password was not successfully deleted. Please try again.' ),
		{
			duration: 8000,
		}
	);

registerHandlers( 'state/data-layer/wpcom/me/two-step/application-passwords/delete/index.js', {
	[ APPLICATION_PASSWORD_DELETE ]: [
		dispatchRequest( {
			fetch: removeApplicationPassword,
			onSuccess: handleRemoveSuccess,
			onError: handleRemoveError,
		} ),
	],
} );
