/**
 * External dependencies
 */
import wpcomProxyRequest from 'wpcom-proxy-request';
import debugFactory from 'debug';

const debug = debugFactory( 'data-stores:utils:wpcom-wrapper' );

export function wpcomRequest( params ) {
	return new Promise( ( resolve, reject ) => {
		wpcomProxyRequest( params, ( err, res ) => {
			debug( res );
			err ? reject( err ) : resolve( res );
		} );
	} );
}
