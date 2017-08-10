/** @format *
/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import createSelector from 'lib/create-selector';

/**
 * Returns list of Activity Log items.
 *
 * @param {Object} state Global state tree
 * @param {number|string} siteId the site ID
 * @return {?array} Activity log item objects. Null if no data.
 */
const getActivityLogs = createSelector(
	( state, siteId ) => {
		const manager = get( state, [ 'activityLog', 'logItems', siteId ], null );
		if ( ! manager ) {
			return null;
		}

		return manager.getItems();
	},
	( state, siteId ) => get( state, [ 'activityLog', 'logItems', siteId ] )
);

export default getActivityLogs;
