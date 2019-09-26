/**
 * Internal dependencies
 */
import { emptyFilter } from 'state/activity-log/reducer';

export const getActivityLogFilter = ( state, siteId ) => {
	try {
		return state.activityLog.filter[ siteId ] || emptyFilter;
	} catch ( e ) {
		return emptyFilter;
	}
};

export default getActivityLogFilter;
