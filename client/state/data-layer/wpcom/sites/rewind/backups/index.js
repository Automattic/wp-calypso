import {
	REWIND_BACKUPS_REQUEST,
	REWIND_BACKUPS_REQUEST_FAILURE,
	REWIND_BACKUPS_SET,
} from 'calypso/state/action-types';
import { registerHandlers } from 'calypso/state/data-layer/handler-registry';
import { http } from 'calypso/state/data-layer/wpcom-http/actions';
import { noRetry } from 'calypso/state/data-layer/wpcom-http/pipeline/retry-on-failure/policies';
import { dispatchRequest } from 'calypso/state/data-layer/wpcom-http/utils';
import { setRewindBackups } from 'calypso/state/rewind/backups/actions';

export const fetchBackups = ( action ) => {
	return http(
		{
			method: 'GET',
			path: `/sites/${ action.siteId }/rewind/backups`,
			apiNamespace: 'wpcom/v2',
			retryPolicy: noRetry(),
		},
		action
	);
};

export const onError = ( siteId, backups ) => [
	{
		type: REWIND_BACKUPS_REQUEST_FAILURE,
		siteId,
	},
	{
		type: REWIND_BACKUPS_SET,
		siteId,
		backups,
	},
];

export const setBackups = ( { siteId }, backups ) => setRewindBackups( siteId, backups );

export const resetBackups = ( { siteId } ) => onError( siteId, [] );

registerHandlers( 'state/data-layer/wpcom/sites/rewind/backups/index.js', {
	[ REWIND_BACKUPS_REQUEST ]: [
		dispatchRequest( {
			fetch: fetchBackups,
			onSuccess: setBackups,
			onError: resetBackups,
		} ),
	],
} );
