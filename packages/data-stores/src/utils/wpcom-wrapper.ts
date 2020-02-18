/**
 * External dependencies
 */
import wpcomProxyRequest, { reloadProxy } from 'wpcom-proxy-request';
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
	body?: object;
	token?: string;
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
/*
 * Reloading the proxy ensures that the proxy iframe has set the correct API cookie.
 * This is particularly useful for making authenticated API requests
 * *after* the user has logged in or signed up without the need for a hard browser refresh.
 */
export function reloadWpcomProxy(): void {
	reloadProxy();
}

wpcomProxyRequest( { metaAPI: { accessAllUsersBlogs: true } }, ( error: Error ) => {
	if ( error ) {
		throw error;
	}
	debug( 'Proxy now running in "access all user\'s blogs" mode' );
} );
