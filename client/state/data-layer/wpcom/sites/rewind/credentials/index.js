import { translate } from 'i18n-calypso';
import {
	JETPACK_CREDENTIALS_TEST,
	JETPACK_CREDENTIALS_TEST_FAILURE,
	JETPACK_CREDENTIALS_TEST_SUCCESS,
} from 'calypso/state/action-types';
import { registerHandlers } from 'calypso/state/data-layer/handler-registry';
import { http } from 'calypso/state/data-layer/wpcom-http/actions';
import { dispatchRequest } from 'calypso/state/data-layer/wpcom-http/utils';
import { errorNotice } from 'calypso/state/notices/actions';

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

export const testCredentialsSucceeded = ( { siteId, role }, { ok } ) => ( {
	type: JETPACK_CREDENTIALS_TEST_SUCCESS,
	siteId,
	role,
	testResult: ok,
} );

export const testCredentialsFailed = ( { siteId, role }, error ) => [
	errorNotice(
		translate( `There was a problem testing your site credentials. Please refresh the page.` )
	),
	{
		type: JETPACK_CREDENTIALS_TEST_FAILURE,
		siteId,
		role,
		wpcomError: error,
	},
];

registerHandlers( 'state/data-layer/wpcom/sites/rewind/credentials', {
	[ JETPACK_CREDENTIALS_TEST ]: [
		dispatchRequest( {
			fetch: testCredentials,
			onSuccess: testCredentialsSucceeded,
			onError: testCredentialsFailed,
		} ),
	],
} );
