/** @format */

/**
 * External dependencies
 */
import { noop } from 'lodash';

/**
 * Internal dependencies
 */
import deleteHandler from './delete';
import makeJsonSchemaParser from 'lib/make-json-schema-parser';
import schema from './schema';
import { CONNECTED_APPLICATIONS_REQUEST } from 'state/action-types';
import { dispatchRequestEx } from 'state/data-layer/wpcom-http/utils';
import { http } from 'state/data-layer/wpcom-http/actions';
import { mergeHandlers } from 'state/action-watchers/utils';
import { receiveConnectedApplications } from 'state/connected-applications/actions';

import { registerHandlers } from 'state/data-layer/handler-registry';

export const apiTransformer = data => data.connected_applications;

/**
 * Dispatches a request to fetch connected applications of the current user
 *
 * @param   {Object} action Redux action
 * @returns {Object} Dispatched http action
 */
export const requestConnectedApplications = action =>
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

const requestHandler = {
	[ CONNECTED_APPLICATIONS_REQUEST ]: [
		dispatchRequestEx( {
			fetch: requestConnectedApplications,
			onSuccess: handleRequestSuccess,
			onError: noop,
			fromApi: makeJsonSchemaParser( schema, apiTransformer, {} ),
		} ),
	],
};

registerHandlers(
	'state/data-layer/wpcom/me/connected-applications/index.js',
	mergeHandlers( requestHandler, deleteHandler )
);

export default {};
