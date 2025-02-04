import { stripHTML } from 'calypso/lib/formatting/strip-html';
import wpcom from 'calypso/lib/wp';

export function requestRestore( { siteId, successNotice, errorNotice, translate } ) {
	wpcom.req
		.post( {
			path: `/sites/${ siteId }/hosting/restore-plan-software`,
			apiNamespace: 'wpcom/v2',
		} )
		.then( () => {
			successNotice(
				translate( 'Requested restoration of plugins and themes that come with your plan.' )
			);
		} )
		.catch( ( error ) => {
			const message =
				stripHTML( error.message ) ||
				translate( 'Failed to request restoration of plan plugin and themes.' );
			errorNotice( message );
		} );
}
