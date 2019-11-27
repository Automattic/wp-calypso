/**
 * Internal dependencies
 */
import { http } from 'state/data-layer/wpcom-http/actions';
import { dispatchRequest } from 'state/data-layer/wpcom-http/utils';
import { registerHandlers } from 'state/data-layer/handler-registry';
import { REWIND_BACKUPS_REQUEST } from 'state/action-types';
import { setRewindBackups } from 'state/rewind/backups/actions';

const fetchBackups = action => {
	return http(
		{
			method: 'GET',
			path: `/sites/${ action.siteId }/rewind/backups`,
			apiNamespace: 'wpcom/v2',
		},
		action
	);
};

const setBackups = ( { siteId }, backups ) => setRewindBackups( siteId, backups );

const resetBackups = ( { siteId } ) => setRewindBackups( siteId, [] );

registerHandlers( 'state/data-layer/wpcom/sites/rewind/backups/index.js', {
	[ REWIND_BACKUPS_REQUEST ]: [
		dispatchRequest( {
			fetch: fetchBackups,
			onSuccess: setBackups,
			onError: resetBackups,
		} ),
	],
} );
