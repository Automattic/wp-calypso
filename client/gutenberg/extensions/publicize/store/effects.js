/**
 * External dependencies
 */
import apiFetch from '@wordpress/api-fetch';

/**
 * Internal dependencies
 */
import { setConnectionTestResults } from './actions';

/**
 * Effect handler which will refresh the connection test results.
 *
 * @param {Object} action Action which had initiated the effect handler.
 * @param {Object} store  Store instance.
 *
 * @return {Object} Refresh connection test results action.
 */
export async function refreshConnectionTestResults( action, store ) {
	const { dispatch } = store;

	const results = await apiFetch( { path: '/wpcom/v2/publicize/connection-test-results' } );

	return dispatch( setConnectionTestResults( results ) );
}

export default {
	REFRESH_CONNECTION_TEST_RESULTS: refreshConnectionTestResults,
};
