/**
 * External dependencies
 */
import wpcomProxyRequest from 'wpcom-proxy-request';
import debugFactory from 'debug';

const debug = debugFactory( 'data-stores:utils:wpcom-wrapper' );

wpcomProxyRequest( { metaAPI: { accessAllUsersBlogs: true } }, ( error: Error ) => {
	if ( error ) {
		throw error;
	}
	debug( 'Proxy now running in "access all user\'s blogs" mode' );
} );
