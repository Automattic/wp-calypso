/**
 * External dependencies
 */
import wpcomProxyRequest from 'wpcom-proxy-request';
import debugFactory from 'debug';

const debug = debugFactory( 'data-stores:utils:wpcom-wrapper' );

export interface WpcomRequestParams {
	path: string;
	method?: string;
	apiVersion?: string;
	formData?: object;
}

export function wpcomRequest< T >( params: WpcomRequestParams ): Promise< T > {
	return new Promise( ( resolve, reject ) => {
		wpcomProxyRequest( params, ( err: object, res: T ) => {
			debug( res );
			err ? reject( err ) : resolve( res );
		} );
	} );
}

wpcomProxyRequest( { metaAPI: { accessAllUsersBlogs: true } }, ( error: object ) => {
	if ( error ) {
		throw error;
	}
	debug( 'Proxy now running in "access all user\'s blogs" mode' );
} );
