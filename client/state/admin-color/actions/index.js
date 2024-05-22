import wpcom from 'calypso/lib/wp';
import 'calypso/state/admin-color/init';
import { ADMIN_COLOR_RECEIVE } from 'calypso/state/action-types';

export function requestAdminColor( siteId ) {
	return ( dispatch ) =>
		wpcom.req
			.get( {
				path: `/sites/${ siteId }/admin-color/`,
				apiNamespace: 'wpcom/v2',
			} )
			.then( ( response ) => {
				dispatch( {
					type: ADMIN_COLOR_RECEIVE,
					siteId,
					adminColor: response.admin_color,
				} );
			} )
			.catch( {
				// Do nothing
			} );
}
