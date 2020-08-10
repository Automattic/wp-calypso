/**
 * External Dependencies
 */
import { requestActivityLogs } from 'state/data-getters';

/**
 * Get all the activities of the site. It queries all the activity pages from the API
 *
 * @param siteId The site id
 * @param filter The active filter for the request
 * @returns {{activities: [], areActivitiesRetrieved: boolean}} An object with the status and the activities
 */
export const retrieveAllActivities = ( siteId, filter ) => {
	let areActivitiesRetrieved = false;
	let activities = [];

	filter.queryPage = 1;

	let response = requestActivityLogs( siteId, filter );

	if ( response.state === 'success' ) {
		areActivitiesRetrieved = true;
		activities = [ ...activities, ...response.data.activities ];

		// If after the first result has more pages, let's retrieve all of them
		for ( let page = 2; page <= response.data.totalPages; page++ ) {
			filter.queryPage = page;
			response = requestActivityLogs( siteId, filter );

			if ( response.state === 'success' ) {
				areActivitiesRetrieved = true;
				activities = [ ...activities, ...response.data.activities ];
			} else {
				areActivitiesRetrieved = false;
			}
		}
	}

	return {
		areActivitiesRetrieved,
		activities,
		state: response.state,
	};
};
