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
		const totalPages = response.data.totalPages;
		const maxPagesToRetrieve = 6;

		areActivitiesRetrieved = true;
		activities = [ ...activities, ...response.data.activities ];

		// If we have more pages, let's retrieve them
		for ( let page = 2; page <= maxPagesToRetrieve && page <= totalPages; page++ ) {
			filter.queryPage = page;
			response = requestActivityLogs( siteId, filter );

			if ( response.state === 'success' ) {
				areActivitiesRetrieved = true;
				activities = [ ...activities, ...response.data.activities ];
			} else {
				areActivitiesRetrieved = false;
			}
		}

		// After the page 5, we change the method to retrieve the activities (ES constrain)
		if ( response.state === 'success' && response.data.page >= maxPagesToRetrieve ) {
			// Fix it to page 1 for the cache ID.
			filter.queryPage = 1;
			// The query is from the last activity received (nextAfter)
			while ( response.data && 'nextAfter' in response.data ) {
				filter.search_after = response.data.nextAfter;
				response = requestActivityLogs( siteId, filter );

				if ( response.state === 'success' ) {
					areActivitiesRetrieved = true;
					activities = [ ...activities, ...response.data.activities ];

					// If the API stuck in the same nextAfter activity, break the loop
					if ( filter.search_after === response.data.nextAfter ) {
						delete filter.search_after;
						break;
					}
				} else {
					areActivitiesRetrieved = false;
				}

				// Remove the filter after the query
				delete filter.search_after;
			}
		}
	}

	return {
		areActivitiesRetrieved,
		activities,
		state: response.state,
	};
};
