/**
 * Internal dependencies
 */
import wpcom from 'lib/wp';
import {
	STORE_SETUP_FETCH,
	STORE_SETUP_FETCH_FAILURE,
	STORE_SETUP_FETCH_SUCCESS,
} from 'state/action-types';

import 'state/store-setup/init';

/**
 * Returns a function which, when invoked, triggers a network request to fetch the store setup data.
 *
 * @returns {Function} Action thunk
 */
export function fetchStoreSetupData( siteId ) {
	return ( dispatch ) => {
		dispatch( {
			type: STORE_SETUP_FETCH,
			siteId,
		} );

		// getStoreSetupDataPath should point to the endpoint that provides the wc task list data;
		const getStoreSetupDataPath = `/me/connected_accounts/list`;
		return wpcom.req
			.get( getStoreSetupDataPath )
			.then( ( data ) => {
				dispatch( {
					type: STORE_SETUP_FETCH_SUCCESS,
					data: { remainingTasks: 5, timing: 3, totalTasks: 10, isHidden: false },
				} );
			} )
			.catch( ( error ) => {
				dispatch( {
					type: STORE_SETUP_FETCH_FAILURE,
					error,
				} );
			} );
	};
}
