import { JETPACK_CREDENTIALS_TEST } from 'calypso/state/action-types';
import { registerHandlers } from 'calypso/state/data-layer/handler-registry';
import { http } from 'calypso/state/data-layer/wpcom-http/actions';
import { dispatchRequest } from 'calypso/state/data-layer/wpcom-http/utils';
import {
	markCredentialsAsInvalid,
	updateCredentialsTestResult,
} from 'calypso/state/jetpack/credentials/actions';

export const testCredentials = ( action ) =>
	http(
		{
			apiNamespace: 'wpcom/v2',
			method: 'POST',
			path: `/sites/${ action.siteId }/rewind/credentials/test`,
			query: {
				role: action.role,
			},
			body: {},
		},
		action
	);

export const testCredentialsSucceeded = ( { siteId, role }, { ok: testResult } ) =>
	updateCredentialsTestResult( siteId, role, testResult );

export const testCredentialsFailed = ( { siteId, role } ) =>
	markCredentialsAsInvalid( siteId, role );

registerHandlers( 'state/data-layer/wpcom/sites/rewind/credentials', {
	[ JETPACK_CREDENTIALS_TEST ]: [
		dispatchRequest( {
			fetch: testCredentials,
			onSuccess: testCredentialsSucceeded,
			onError: testCredentialsFailed,
		} ),
	],
} );
