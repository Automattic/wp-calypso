import {
	JETPACK_BACKUP_RETENTION_UPDATE,
	JETPACK_BACKUP_RETENTION_UPDATE_ERROR,
	JETPACK_BACKUP_RETENTION_UPDATE_SUCCESS,
} from 'calypso/state/action-types';
import { registerHandlers } from 'calypso/state/data-layer/handler-registry';
import { http } from 'calypso/state/data-layer/wpcom-http/actions';
import { dispatchRequest } from 'calypso/state/data-layer/wpcom-http/utils';
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

const onSuccess = ( { siteId }: UpdateRequestActionType ) => ( {
	type: JETPACK_BACKUP_RETENTION_UPDATE_SUCCESS,
	siteId,
} );

const onError = ( { siteId }: UpdateRequestActionType, error: string ) => ( {
	type: JETPACK_BACKUP_RETENTION_UPDATE_ERROR,
	siteId,
	error,
} );

registerHandlers( 'state/data-layer/wpcom/sites/rewind/retention', {
	[ JETPACK_BACKUP_RETENTION_UPDATE ]: [
		dispatchRequest( {
			fetch: updateRetention,
			onSuccess,
			onError,
		} ),
	],
} );
