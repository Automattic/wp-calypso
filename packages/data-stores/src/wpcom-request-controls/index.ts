/**
 * External dependencies
 */
import wpcomProxyRequest from 'wpcom-proxy-request';
import debugFactory from 'debug';

type WpcomProxyRequestOptions = Parameters< typeof wpcomProxyRequest >[ 0 ];

const debug = debugFactory( 'data-stores:utils:wpcom-wrapper' );

export const wpcomRequest = ( request: WpcomProxyRequestOptions ) =>
	( { type: 'WPCOM_REQUEST', request } as const );

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

export function createControls( clientCreds?: WpcomClientCredentials ) {
	return {
		WPCOM_REQUEST: ( { request }: ReturnType< typeof wpcomRequest > ) => {
			const params = { ...request };

			if ( clientCreds ) {
				params.body = {
					...( clientCreds || {} ),
					...( params.body || {} ),
				};
			}

			return triggerWpcomRequest( params );
		},
	} as const;
}
