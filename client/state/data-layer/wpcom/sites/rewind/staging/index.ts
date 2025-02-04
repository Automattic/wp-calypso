import {
	JETPACK_BACKUP_STAGING_GET_REQUEST,
	JETPACK_BACKUP_STAGING_GET_REQUEST_FAILURE,
	JETPACK_BACKUP_STAGING_GET_REQUEST_SUCCESS,
} from 'calypso/state/action-types';
import { registerHandlers } from 'calypso/state/data-layer/handler-registry';
import { http } from 'calypso/state/data-layer/wpcom-http/actions';
import { dispatchRequest } from 'calypso/state/data-layer/wpcom-http/utils';
import type {
	APIRewindStagingSiteGet,
	GetStagingSiteRequestActionType,
} from 'calypso/state/rewind/staging/types';

export const fetch = ( action: GetStagingSiteRequestActionType ) =>
	http(
		{
			apiNamespace: 'wpcom/v2',
			method: 'GET',
			path: `/sites/${ action.siteId }/rewind/staging`,
			query: {
				force: 'wpcom',
			},
		},
		action
	);

const onSuccess = (
	{ siteId }: GetStagingSiteRequestActionType,
	response: APIRewindStagingSiteGet
) => [
	{
		type: JETPACK_BACKUP_STAGING_GET_REQUEST_SUCCESS,
		siteId,
		site: response.info,
	},
];

const onError = ( { siteId }: GetStagingSiteRequestActionType, error: string ) => [
	{
		type: JETPACK_BACKUP_STAGING_GET_REQUEST_FAILURE,
		siteId,
		error,
	},
];

registerHandlers( 'state/data-layer/wpcom/sites/rewind/staging', {
	[ JETPACK_BACKUP_STAGING_GET_REQUEST ]: [
		dispatchRequest( {
			fetch,
			onSuccess,
			onError,
		} ),
	],
} );
