import { translate } from 'i18n-calypso';
import {
	JETPACK_BACKUP_RETENTION_UPDATE,
	JETPACK_BACKUP_RETENTION_UPDATE_ERROR,
	JETPACK_BACKUP_RETENTION_UPDATE_SUCCESS,
} from 'calypso/state/action-types';
import { registerHandlers } from 'calypso/state/data-layer/handler-registry';
import { http } from 'calypso/state/data-layer/wpcom-http/actions';
import { dispatchRequest } from 'calypso/state/data-layer/wpcom-http/utils';
import { errorNotice, successNotice } from 'calypso/state/notices/actions';
import { setBackupRetention } from 'calypso/state/rewind/retention/actions';
import type { UpdateRequestActionType } from 'calypso/state/rewind/retention/types';

export const updateRetention = ( action: UpdateRequestActionType ) =>
	http(
		{
			apiNamespace: 'wpcom/v2',
			method: 'POST',
			path: `/sites/${ action.siteId }/backup/retention/update`,
			body: { retention_days: action.retentionDays },
		},
		action
	);

const onSuccess = ( { siteId, retentionDays }: UpdateRequestActionType ) => [
	{
		type: JETPACK_BACKUP_RETENTION_UPDATE_SUCCESS,
		siteId,
	},
	// This will update the backup retention period in the state,
	// so we don't need to fetch again the updated value from API
	setBackupRetention( siteId, retentionDays ),
	successNotice(
		translate( 'You have successfully changed the time period of saved backups to %(days)d days', {
			args: {
				days: retentionDays,
			},
		} ),
		{
			duration: 5000,
		}
	),
];

const onError = ( { siteId }: UpdateRequestActionType, error: string ) => [
	{
		type: JETPACK_BACKUP_RETENTION_UPDATE_ERROR,
		siteId,
		error,
	},
	errorNotice( translate( 'Update settings failed. Please, try again.' ), {
		duration: 5000,
	} ),
];

registerHandlers( 'state/data-layer/wpcom/sites/rewind/retention', {
	[ JETPACK_BACKUP_RETENTION_UPDATE ]: [
		dispatchRequest( {
			fetch: updateRetention,
			onSuccess,
			onError,
		} ),
	],
} );
