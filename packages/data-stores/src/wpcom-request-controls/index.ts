/**
 * External dependencies
 */
import wpcomProxyRequest from 'wpcom-proxy-request';
import { controls } from '@wordpress/data-controls';

type WpcomProxyRequestOptions = Parameters< typeof wpcomProxyRequest >[ 0 ];

export const wpcomRequest = ( request: WpcomProxyRequestOptions ) =>
	( { type: 'WPCOM_REQUEST', request } as const );

export interface WpcomClientCredentials {
	client_id: string;
	client_secret: string;
}

export function createControls( clientCreds?: WpcomClientCredentials ) {
	return {
		...controls,
		WPCOM_REQUEST: ( { request }: ReturnType< typeof wpcomRequest > ) => {
			const params = { ...request };

			if ( clientCreds ) {
				params.body = {
					...( clientCreds || {} ),
					...( params.body || {} ),
				};
			}

			return wpcomProxyRequest( params );
		},
	} as const;
}
