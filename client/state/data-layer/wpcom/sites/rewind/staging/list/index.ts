import {
	JETPACK_BACKUP_STAGING_LIST_REQUEST,
	JETPACK_BACKUP_STAGING_LIST_REQUEST_FAILURE,
	JETPACK_BACKUP_STAGING_LIST_REQUEST_SUCCESS,
} from 'calypso/state/action-types';
import { registerHandlers } from 'calypso/state/data-layer/handler-registry';
import { http } from 'calypso/state/data-layer/wpcom-http/actions';
import { dispatchRequest } from 'calypso/state/data-layer/wpcom-http/utils';
import type { APIRewindStagingSiteList } from 'calypso/state/rewind/staging/types';
import type { AnyAction } from 'redux';

type RequestActionType = AnyAction & {
	siteId: number;
};

export const fetch = ( action: RequestActionType ) =>
	http(
		{
			apiNamespace: 'wpcom/v2',
			method: 'GET',
			path: `/sites/${ action.siteId }/rewind/staging/list`,
			query: {
				force: 'wpcom',
			},
		},
		action
	);

const onSuccess = ( { siteId }: RequestActionType, response: APIRewindStagingSiteList ) => [
	{
		type: JETPACK_BACKUP_STAGING_LIST_REQUEST_SUCCESS,
		siteId,
		stagingSitesList: response.sites_info,
	},
];

const onError = ( { siteId }: RequestActionType, error: string ) => [
	{
		type: JETPACK_BACKUP_STAGING_LIST_REQUEST_FAILURE,
		siteId,
		error,
	},
];

registerHandlers( 'state/data-layer/wpcom/sites/rewind/staging/list', {
	[ JETPACK_BACKUP_STAGING_LIST_REQUEST ]: [
		dispatchRequest( {
			fetch,
			onSuccess,
			onError,
		} ),
	],
} );
