import makeJsonSchemaParser from 'calypso/lib/make-json-schema-parser';
import { CONNECTED_APPLICATIONS_REQUEST } from 'calypso/state/action-types';
import { receiveConnectedApplications } from 'calypso/state/connected-applications/actions';
import { registerHandlers } from 'calypso/state/data-layer/handler-registry';
import { http } from 'calypso/state/data-layer/wpcom-http/actions';
import { dispatchRequest } from 'calypso/state/data-layer/wpcom-http/utils';
import schema from './schema';

const noop = () => {};

export const apiTransformer = ( data ) => data.connected_applications;

/**
 * Dispatches a request to fetch connected applications of the current user
 *
 * @param   {Object} action Redux action
 * @returns {Object} Dispatched http action
 */
export const requestConnectedApplications = ( action ) =>
	http(
		{
			apiVersion: '1.1',
			method: 'GET',
			path: '/me/connected-applications',
		},
		action
	);

/**
 * Dispatches a user connected applications receive action when the request succeeded.
 *
 * @param   {Object} action Redux action
 * @param   {Object} apps   Connected applications
 * @returns {Object} Dispatched user connected applications receive action
 */
export const handleRequestSuccess = ( action, apps ) => receiveConnectedApplications( apps );

registerHandlers( 'state/data-layer/wpcom/me/connected-applications/index.js', {
	[ CONNECTED_APPLICATIONS_REQUEST ]: [
		dispatchRequest( {
			fetch: requestConnectedApplications,
			onSuccess: handleRequestSuccess,
			onError: noop,
			fromApi: makeJsonSchemaParser( schema, apiTransformer, {} ),
		} ),
	],
} );
