/**
 * Internal Dependencies
 */
import wp from 'lib/wp';
import {
	GOOGLE_APPS_USERS_FETCH,
	GOOGLE_APPS_USERS_FETCH_COMPLETED,
	GOOGLE_APPS_USERS_FETCH_FAILED
} from 'state/action-types';

const wpcom = wp.undocumented();

/**
 * Fetches Google Apps users data by domain
 * @param {string} domain - Domain to fetch for
 * @returns {Function} - Wrapped function that accepts `dispatch`
 */
export function fetchByDomain( domain ) {
	return ( dispatch ) => {
		dispatch( {
			type: GOOGLE_APPS_USERS_FETCH,
			domain
		} );

		return wpcom.googleAppsFilterByDomain( domain ).then( data => {
			dispatch( {
				type: GOOGLE_APPS_USERS_FETCH_COMPLETED,
				items: data.accounts
			} );
		}, ( error ) => {
			dispatch( {
				type: GOOGLE_APPS_USERS_FETCH_FAILED,
				error
			} );
		} );
	};
}

/**
 * Fetches Google Apps users data by siteId
 * @param {number} siteId - Site ID to fetch for
 * @returns {Function} - Wrapped function that accepts `dispatch`
 */
export function fetchBySiteId( siteId ) {
	return ( dispatch ) => {
		dispatch( {
			type: GOOGLE_APPS_USERS_FETCH,
			siteId
		} );

		return wpcom.googleAppsFilterBySiteId( siteId ).then( data => {
			dispatch( {
				type: GOOGLE_APPS_USERS_FETCH_COMPLETED,
				items: data.accounts
			} );
		}, ( error ) => {
			dispatch( {
				type: GOOGLE_APPS_USERS_FETCH_FAILED,
				error
			} );
		} );
	};
}
