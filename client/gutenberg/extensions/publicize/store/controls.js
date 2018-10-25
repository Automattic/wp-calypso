/**
 * External dependencies
 */
import apiFetch from '@wordpress/api-fetch';

/**
 * Trigger an API Fetch request.
 *
 * @param {Object} action Action Object.
 *
 * @return {Promise} Fetch request promise.
 */
const fetchFromApi = action => {
	return apiFetch( { path: action.path } );
};

export default {
	FETCH_FROM_API: fetchFromApi,
};
