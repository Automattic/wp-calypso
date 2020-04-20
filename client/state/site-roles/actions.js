/**
 * Internal dependencies
 */

import wpcom from 'lib/wp';
import {
	SITE_ROLES_RECEIVE,
	SITE_ROLES_REQUEST,
	SITE_ROLES_REQUEST_FAILURE,
	SITE_ROLES_REQUEST_SUCCESS,
} from 'state/action-types';

export function requestSiteRoles( siteId ) {
	return ( dispatch ) => {
		dispatch( {
			type: SITE_ROLES_REQUEST,
			siteId,
		} );

		return wpcom
			.undocumented()
			.site( siteId )
			.getRoles()
			.then( ( { roles } ) => {
				dispatch( {
					type: SITE_ROLES_REQUEST_SUCCESS,
					siteId,
				} );

				dispatch( {
					type: SITE_ROLES_RECEIVE,
					siteId,
					roles,
				} );
			} )
			.catch( () => {
				dispatch( {
					type: SITE_ROLES_REQUEST_FAILURE,
					siteId,
				} );
			} );
	};
}
