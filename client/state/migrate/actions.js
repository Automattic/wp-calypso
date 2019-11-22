/**
 * Internal dependencies
 */
import { SITE_MIGRATE_REQUEST } from 'state/action-types';

export default function setMigrationStatus( siteId ) {
	return dispatch => {
		dispatch( {
			type: SITE_MIGRATE_REQUEST,
			siteId,
		} );
	};
}
