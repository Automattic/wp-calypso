/**
 * Internal dependencies
 */
import { REWIND_BACKUPS_REQUEST, REWIND_BACKUPS_SET } from 'calypso/state/action-types';

import 'calypso/state/data-layer/wpcom/sites/rewind/backups';
import 'calypso/state/rewind/init';

export const requestRewindBackups = ( siteId ) => ( {
	type: REWIND_BACKUPS_REQUEST,
	siteId,
} );

export const setRewindBackups = ( siteId, backups ) => ( {
	type: REWIND_BACKUPS_SET,
	siteId,
	backups,
} );
