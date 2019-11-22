/**
 * Internal dependencies
 */
import { SITE_MIGRATE_REQUEST } from 'state/action-types';

const migrate = ( state = {}, action ) => {
	switch ( action.type ) {
		case SITE_MIGRATE_REQUEST: {
			const { siteId } = action;
			if ( state.sites && state.sites.items[ siteId ] ) {
				state.sites.items[ siteId ].migration_status = 'migrating';
			}
			return state;
		}
	}

	return state;
};

export default migrate;
