/**
 * External dependencies
 */
import wpcomProxyRequest from 'wpcom-proxy-request';
import debugFactory from 'debug';

const debug = debugFactory( 'data-stores:utils:wpcom-wrapper' );

export interface WpcomClientCredentials {
	client_id: string;
	client_secret: string;
}

export interface WpcomRequestParams {
	path?: string;
	method?: string;
	apiVersion?: string;
	body?: {
		[ propName: string ]: string | number | boolean;
	};
	metaAPI?: {
		accessAllUsersBlogs?: boolean;
	};
}

export function wpcomRequest< T >( params: WpcomRequestParams ): Promise< T > {
	return new Promise( ( resolve, reject ) => {
		wpcomProxyRequest( params, ( err: Error, res: T ) => {
			debug( res );
			err ? reject( err ) : resolve( res );
		} );
	} );
}

wpcomProxyRequest( { metaAPI: { accessAllUsersBlogs: true } }, ( error: Error ) => {
	if ( error ) {
		throw error;
	}
	debug( 'Proxy now running in "access all user\'s blogs" mode' );
} );
