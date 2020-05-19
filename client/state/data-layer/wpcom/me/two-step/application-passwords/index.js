/**
 * External dependencies
 */
import { noop } from 'lodash';

/**
 * Internal dependencies
 */
import makeJsonSchemaParser from 'lib/make-json-schema-parser';
import schema from './schema';
import { APPLICATION_PASSWORDS_REQUEST } from 'state/action-types';
import { dispatchRequest } from 'state/data-layer/wpcom-http/utils';
import { http } from 'state/data-layer/wpcom-http/actions';
import { receiveApplicationPasswords } from 'state/application-passwords/actions';

import { registerHandlers } from 'state/data-layer/handler-registry';

export const apiTransformer = ( data ) => data.application_passwords;

/**
 * Dispatches a request to fetch application passwords of the current user
 *
 * @param   {object} action Redux action
 * @returns {object} Dispatched http action
 */
export const requestApplicationPasswords = ( action ) =>
	http(
		{
			apiVersion: '1.1',
			method: 'GET',
			path: '/me/two-step/application-passwords',
		},
		action
	);

/**
 * Dispatches a user application passwords receive action when the request succeeded.
 *
 * @param   {object} action       Redux action
 * @param   {object} appPasswords Application passwords
 * @returns {object} Dispatched user application passwords receive action
 */
export const handleRequestSuccess = ( action, appPasswords ) =>
	receiveApplicationPasswords( appPasswords );

registerHandlers( 'state/data-layer/wpcom/me/two-step/application-passwords/index.js', {
	[ APPLICATION_PASSWORDS_REQUEST ]: [
		dispatchRequest( {
			fetch: requestApplicationPasswords,
			onSuccess: handleRequestSuccess,
			onError: noop,
			fromApi: makeJsonSchemaParser( schema, apiTransformer ),
		} ),
	],
} );
