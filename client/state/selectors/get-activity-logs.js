/** @format *
/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import ActivityQueryManager from 'lib/query-manager/activity';
import createSelector from 'lib/create-selector';

/**
 * Returns list of Activity Log items.
 *
 * @param  {Object}        state  Global state tree
 * @param  {number|string} siteId the site ID
 * @param  {?Object}       query  Optional. Query object, passed to ActivityQueryManager.
 * @return {?array}               Activity log item objects. Null if no data.
 */
const getActivityLogs = createSelector(
	( state, siteId, query ) => {
		const manager = get( state, [ 'activityLog', 'logItems', siteId ], null );
		if ( ! manager ) {
			return null;
		}

		return manager.getItems( query );
	},
	( state, siteId ) => get( state, [ 'activityLog', 'logItems', siteId ] ),
	( state, siteId, query ) => ActivityQueryManager.QueryKey.stringify( query )
);

export default getActivityLogs;
