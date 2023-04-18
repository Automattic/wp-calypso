import {
	JETPACK_BACKUP_STAGING_LIST_REQUEST,
	JETPACK_BACKUP_STAGING_LIST_REQUEST_FAILURE,
	JETPACK_BACKUP_STAGING_LIST_REQUEST_SUCCESS,
} from 'calypso/state/action-types';
import { registerHandlers } from 'calypso/state/data-layer/handler-registry';
import { http } from 'calypso/state/data-layer/wpcom-http/actions';
import { dispatchRequest } from 'calypso/state/data-layer/wpcom-http/utils';
//import fromApi from './from-api';
import { successNotice, errorNotice } from 'calypso/state/notices/actions';
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
	//@TODO: Remove this notice. Just a temp solution to show success message while development is in progress
	successNotice( 'Success fetching staging list.', {
		duration: 5000,
	} ),
];

const onError = ( { siteId }: RequestActionType, error: string ) => [
	{
		type: JETPACK_BACKUP_STAGING_LIST_REQUEST_FAILURE,
		siteId,
		error,
	},
	//@TODO: Remove this notice. Just a temp solution to show the error message while development is in progress
	errorNotice( 'Could not retrieve staging sites. Please try again later.', {
		duration: 5000,
	} ),
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
