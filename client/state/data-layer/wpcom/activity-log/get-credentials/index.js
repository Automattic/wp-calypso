import { translate } from 'i18n-calypso';
import {
	JETPACK_CREDENTIALS_GET,
	JETPACK_CREDENTIALS_GET_FAILURE,
	JETPACK_CREDENTIALS_GET_SUCCESS,
} from 'calypso/state/action-types';
import { registerHandlers } from 'calypso/state/data-layer/handler-registry';
import { http } from 'calypso/state/data-layer/wpcom-http/actions';
import { dispatchRequest } from 'calypso/state/data-layer/wpcom-http/utils';
import { errorNotice } from 'calypso/state/notices/actions';

export const getCredentials = ( action ) =>
	http(
		{
			method: 'GET',
			path: `/activity-log/${ action.siteId }/get-credentials`,
			apiVersion: '1',
		},
		action
	);

export const getCredentialsSucceeded = ( { siteId }, { credentials } ) => ( {
	type: JETPACK_CREDENTIALS_GET_SUCCESS,
	credentials,
	siteId,
} );

export const getCredentialsFailed = ( { siteId }, error ) => [
	errorNotice(
		translate( 'There was a problem fetching your site credentials. Please refresh the page.' )
	),
	{
		type: JETPACK_CREDENTIALS_GET_FAILURE,
		siteId,
		wpcomError: error,
	},
];

registerHandlers( 'state/data-layer/wpcom/activity-log/get-credentials', {
	[ JETPACK_CREDENTIALS_GET ]: [
		dispatchRequest( {
			fetch: getCredentials,
			onSuccess: getCredentialsSucceeded,
			onError: getCredentialsFailed,
		} ),
	],
} );
