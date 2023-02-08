import { Action } from 'redux';
import {
	REWIND_BACKUP_RETENTION_UPDATE,
	REWIND_BACKUP_RETENTION_UPDATE_ERROR,
	REWIND_BACKUP_RETENTION_UPDATE_SUCCESS,
} from 'calypso/state/action-types';
import { registerHandlers } from 'calypso/state/data-layer/handler-registry';
import { http } from 'calypso/state/data-layer/wpcom-http/actions';
import { dispatchRequest } from 'calypso/state/data-layer/wpcom-http/utils';
import { RetentionPeriod } from 'calypso/state/rewind/retention/types';

type RequestActionType = Action< typeof REWIND_BACKUP_RETENTION_UPDATE > & {
	siteId: number | null;
	rententionDays: RetentionPeriod;
};

export const updateRetention = ( action: RequestActionType ) =>
	http(
		{
			apiNamespace: 'wpcom/v2',
			method: 'POST',
			path: `/sites/${ action.siteId }/backup/retention/update`,
			body: { retention_days: action.rententionDays },
		},
		action
	);

const onSuccess = ( { siteId }: RequestActionType ) => ( {
	type: REWIND_BACKUP_RETENTION_UPDATE_SUCCESS,
	siteId,
} );

const onError = ( { siteId }: RequestActionType, error: string ) => ( {
	type: REWIND_BACKUP_RETENTION_UPDATE_ERROR,
	siteId,
	error,
} );

registerHandlers( 'state/data-layer/wpcom/sites/rewind/retention', {
	[ REWIND_BACKUP_RETENTION_UPDATE ]: [
		dispatchRequest( {
			fetch: updateRetention,
			onSuccess,
			onError,
		} ),
	],
} );
