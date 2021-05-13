/**
 * Internal dependencies
 */
import { emptyFilter } from 'calypso/state/activity-log/reducer';

import 'calypso/state/activity-log/init';

export const getActivityLogFilter = ( state, siteId ) => {
	try {
		return state.activityLog.filter[ siteId ] || emptyFilter;
	} catch ( e ) {
		return emptyFilter;
	}
};

export default getActivityLogFilter;
