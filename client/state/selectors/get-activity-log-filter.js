/**
 * Internal dependencies
 */
import { emptyFilter } from 'state/activity-log/reducer';

import 'state/activity-log/init';

export const getActivityLogFilter = ( state, siteId ) => {
	try {
		return state.activityLog.filter[ siteId ] || emptyFilter;
	} catch ( e ) {
		return emptyFilter;
	}
};

export default getActivityLogFilter;
