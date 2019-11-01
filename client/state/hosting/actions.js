/**
 * Internal dependencies
 */
import { HOSTING_RESTORE_DATABASE_PASSWORD } from 'state/action-types';
import 'state/data-layer/wpcom/sites/hosting';

export const restoreDatabasePassword = siteId => ( {
	type: HOSTING_RESTORE_DATABASE_PASSWORD,
	siteId,
} );
