import { translate } from 'i18n-calypso';
import { CONNECTED_APPLICATION_DELETE } from 'calypso/state/action-types';
import { deleteConnectedApplicationSuccess } from 'calypso/state/connected-applications/actions';
import { registerHandlers } from 'calypso/state/data-layer/handler-registry';
import { http } from 'calypso/state/data-layer/wpcom-http/actions';
import { dispatchRequest } from 'calypso/state/data-layer/wpcom-http/utils';
import { errorNotice, successNotice } from 'calypso/state/notices/actions';

/**
 * Dispatches a request to delete a connected application for the current user
 *
 * @param   {Object} action Redux action
 * @returns {Object} Dispatched http action
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
 * @param   {Object} action Redux action
 * @param   {string} action.appId
 * @returns {Object} Dispatched user connected applications add action
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
 * @returns {Object} Dispatched error notice action
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
