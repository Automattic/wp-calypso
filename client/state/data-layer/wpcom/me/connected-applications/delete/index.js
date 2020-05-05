/**
 * External dependencies
 */
import { translate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { CONNECTED_APPLICATION_DELETE } from 'state/action-types';
import { deleteConnectedApplicationSuccess } from 'state/connected-applications/actions';
import { dispatchRequest } from 'state/data-layer/wpcom-http/utils';
import { errorNotice, successNotice } from 'state/notices/actions';
import { http } from 'state/data-layer/wpcom-http/actions';

import { registerHandlers } from 'state/data-layer/handler-registry';

/**
 * Dispatches a request to delete a connected application for the current user
 *
 * @param   {object} action Redux action
 * @returns {object} Dispatched http action
 */
export const removeConnectedApplication = ( action ) =>
	http(
		{
			apiVersion: '1.1',
			method: 'POST',
			path: '/me/connected-applications/' + action.appId + '/delete',
		},
		action
	);

/**
 * Dispatches a user connected application removal success action and notice when the request succeeded.
 *
 * @param   {object} action Redux action
 * @returns {object} Dispatched user connected applications add action
 */
export const handleRemoveSuccess = ( { appId } ) => [
	deleteConnectedApplicationSuccess( appId ),
	successNotice(
		translate( 'This application no longer has access to your WordPress.com account.' ),
		{
			duration: 8000,
			id: `connected-app-notice-success-${ appId }`,
		}
	),
];

/**
 * Dispatches an error notice when the request failed.
 *
 * @returns {object} Dispatched error notice action
 */
export const handleRemoveError = () =>
	errorNotice( translate( 'The connected application was not disconnected. Please try again.' ), {
		duration: 8000,
		id: 'connected-app-notice-error',
	} );

registerHandlers( 'state/data-layer/wpcom/me/connected-applications/delete/index.js', {
	[ CONNECTED_APPLICATION_DELETE ]: [
		dispatchRequest( {
			fetch: removeConnectedApplication,
			onSuccess: handleRemoveSuccess,
			onError: handleRemoveError,
		} ),
	],
} );
