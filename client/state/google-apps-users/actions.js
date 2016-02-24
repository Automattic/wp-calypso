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

export function fetchByDomain( domain ) {
	return ( dispatch ) => {
		dispatch( {
			type: GOOGLE_APPS_USERS_FETCH
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
	}
}

export function fetchBySiteId( siteId ) {
	return ( dispatch ) => {
		dispatch( {
			type: GOOGLE_APPS_USERS_FETCH
		} );

		return wpcom.googleAppsFilterBySiteId( siteId ).then( data => {
			dispatch( {
				type: GOOGLE_APPS_USERS_FETCH_COMPLETED,
				items: data.accounts
			} );
		}, ( error ) => {
			return {
				type: GOOGLE_APPS_USERS_FETCH_FAILED,
				error
			}
		} );
	};
}
