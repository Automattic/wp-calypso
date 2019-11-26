/**
 * Internal dependencies
 */
import {
	REWIND_BACKUPS_RECEIVE,
	REWIND_BACKUPS_REQUEST,
	REWIND_BACKUPS_REQUEST_FAILURE,
	REWIND_BACKUPS_REQUEST_SUCCESS,
} from 'state/action-types';

import 'state/data-layer/wpcom/sites/rewind/backups';

export const requestRewindBackups = siteId => ( {
	type: REWIND_BACKUPS_REQUEST,
	siteId,
} );

export const successRewindBackupsRequest = siteId => ( {
	type: REWIND_BACKUPS_REQUEST_SUCCESS,
	siteId,
} );

export const failRewindBackupsRequest = siteId => ( {
	type: REWIND_BACKUPS_REQUEST_FAILURE,
	siteId,
} );

export const receiveRewindBackups = ( siteId, backups ) => ( {
	type: REWIND_BACKUPS_RECEIVE,
	siteId,
	backups,
} );
