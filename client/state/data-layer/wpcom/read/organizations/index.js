/**
 * Internal dependencies
 */
import {
	READER_ORGANIZATIONS_REQUEST,
	READER_ORGANIZATIONS_RECEIVE,
} from 'calypso/state/reader/action-types';
import { dispatchRequest } from 'calypso/state/data-layer/wpcom-http/utils';
import { http } from 'calypso/state/data-layer/wpcom-http/actions';
import { registerHandlers } from 'calypso/state/data-layer/handler-registry';

export const handleOrganizationsRequest = ( action ) =>
	http(
		{
			method: 'GET',
			path: '/read/organizations',
			apiVersion: '1.2',
		},
		action
	);

export const organizationRequestReceived = ( action, apiResponse ) => ( {
	type: READER_ORGANIZATIONS_RECEIVE,
	payload: apiResponse,
} );

export const organizationRequestFailure = ( error ) => ( {
	type: READER_ORGANIZATIONS_RECEIVE,
	payload: error,
	error: true,
} );

registerHandlers( 'state/data-layer/wpcom/read/organizations/index.js', {
	[ READER_ORGANIZATIONS_REQUEST ]: [
		dispatchRequest( {
			fetch: handleOrganizationsRequest,
			onSuccess: organizationRequestReceived,
			onError: organizationRequestFailure,
		} ),
	],
} );
