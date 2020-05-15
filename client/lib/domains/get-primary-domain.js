/**
 * Internal dependencies
 */
import wpcom from 'lib/wp';

export function getPrimaryDomain( siteId, onComplete ) {
	wpcom
		.site( siteId )
		.domain()
		.getPrimary( function ( serverError, data ) {
			onComplete( serverError, data );
		} );
}
