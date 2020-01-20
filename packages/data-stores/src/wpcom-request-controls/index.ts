/**
 * External dependencies
 */
import wpcomProxyRequest from 'wpcom-proxy-request';
import debugFactory from 'debug';

type WpcomProxyRequestOptions = Parameters< typeof wpcomProxyRequest >[ 0 ];

const debug = debugFactory( 'data-stores:utils:wpcom-wrapper' );

const WPCOM_REQUEST = 'WPCOM_REQUEST';

export const wpcomRequest = ( request: WpcomProxyRequestOptions ) => {
	return { type: WPCOM_REQUEST, request } as const;
};

export interface WpcomClientCredentials {
	client_id: string;
	client_secret: string;
}

function triggerWpcomRequest( params: WpcomProxyRequestOptions ): Promise< unknown > {
	return new Promise( ( resolve, reject ) => {
		// @TODO: 3rd parameter `headers`?
		wpcomProxyRequest( params, ( err: null | object, res: unknown ) => {
			debug( res );
			err ? reject( err ) : resolve( res );
		} );
	} );
}

export const createControls = ( credentials: WpcomClientCredentials ) => {
	// @TODO: Is it necessary to send this request? When and why?
	wpcomProxyRequest( { metaAPI: { accessAllUsersBlogs: true } }, ( error: Error ) => {
		if ( error ) {
			throw error;
		}
		debug( 'Proxy now running in "access all user\'s blogs" mode' );
	} );

	return {
		[ WPCOM_REQUEST ]: ( { request }: ReturnType< typeof wpcomRequest > ) => {
			const { body } = request as { body?: object };
			triggerWpcomRequest( {
				...request,
				...( body && {
					client_id: credentials.client_id,
					client_secret: credentials.client_secret,
					...body,
				} ),
			} );
		},
	} as const;
};
