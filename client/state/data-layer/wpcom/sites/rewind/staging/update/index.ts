import { translate } from 'i18n-calypso';
import {
	JETPACK_BACKUP_STAGING_UPDATE_REQUEST,
	JETPACK_BACKUP_STAGING_UPDATE_REQUEST_FAILURE,
	JETPACK_BACKUP_STAGING_UPDATE_REQUEST_SUCCESS,
	JETPACK_BACKUP_STAGING_SET,
} from 'calypso/state/action-types';
import { registerHandlers } from 'calypso/state/data-layer/handler-registry';
import { http } from 'calypso/state/data-layer/wpcom-http/actions';
import { dispatchRequest } from 'calypso/state/data-layer/wpcom-http/utils';
import { successNotice, errorNotice } from 'calypso/state/notices/actions';
import { UpdateStagingFlagRequestActionType } from 'calypso/state/rewind/staging/types';

const updateStagingFlag = ( action: UpdateStagingFlagRequestActionType ) =>
	http(
		{
			apiNamespace: 'wpcom/v2',
			method: 'POST',
			path: `/sites/${ action.siteId }/rewind/staging/update`,
			body: { staging: action.staging },
		},
		action
	);

const updateStagingFlagSuccess = ( { siteId, staging }: UpdateStagingFlagRequestActionType ) => [
	{
		type: JETPACK_BACKUP_STAGING_UPDATE_REQUEST_SUCCESS,
		siteId,
	},
	successNotice( translate( 'Site staging status has been successfully updated.' ), {
		duration: 5000,
		isPersistent: true,
	} ),
	{
		type: JETPACK_BACKUP_STAGING_SET,
		siteId,
		staging,
	},
];

const updateStagingFlagError = (
	{ siteId }: UpdateStagingFlagRequestActionType,
	error: string
) => [
	{
		type: JETPACK_BACKUP_STAGING_UPDATE_REQUEST_FAILURE,
		siteId,
		error,
	},
	errorNotice( translate( 'Updating site staging status failed. Please, try again.' ), {
		duration: 5000,
		isPersistent: true,
	} ),
];

registerHandlers( 'state/data-layer/wpcom/sites/rewind/staging/update', {
	[ JETPACK_BACKUP_STAGING_UPDATE_REQUEST ]: [
		dispatchRequest( {
			fetch: updateStagingFlag,
			onSuccess: updateStagingFlagSuccess,
			onError: updateStagingFlagError,
		} ),
	],
} );
