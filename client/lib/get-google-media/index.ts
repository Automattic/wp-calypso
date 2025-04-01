import wpcom from 'calypso/lib/wp';

export function getGoogleMediaViaProxy( mediaUrl: string ): Promise< Blob > {
	const params = {
		path: '/meta/external-media/proxy/google_photos',
		apiNamespace: 'wpcom/v2',
		body: {
			url: mediaUrl,
		},
	};

	return new Promise( ( resolve, reject ) => {
		return wpcom.req.post(
			{ ...params, responseType: 'blob' },
			( error: Error | null, data: Blob ) => {
				if ( error || ! ( data instanceof globalThis.Blob ) ) {
					reject( error );
				} else {
					resolve( data );
				}
			}
		);
	} );
}

export function getGoogleMediaViaProxyRetry( mediaUrl: string ): Promise< Blob | unknown > {
	let retries = 0;
	const request = () =>
		getGoogleMediaViaProxy( mediaUrl ).catch( ( error: Error ) => {
			// Retry three times with exponential backoff times
			if ( retries < 3 ) {
				return new Promise( ( resolve ) => {
					++retries;
					setTimeout(
						() => {
							resolve( request() );
						},
						( retries * retries * 1000 ) / 2
					);
				} );
			}

			return Promise.reject( error );
		} );

	return request();
}
