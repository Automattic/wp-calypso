import wpcom from 'calypso/lib/wp';

export function getAtomicSiteMediaViaProxy( siteId, mediaPath, { query = '', maxSize } ) {
	const safeQuery = query.replace( /^\?/, '' );
	const params = {
		path: `/sites/${ siteId }/atomic-auth-proxy/file?path=${ mediaPath }&${ safeQuery }`,
		apiNamespace: 'wpcom/v2',
	};

	return new Promise( ( resolve, reject ) => {
		const fetchMedia = () =>
			wpcom.req.get( { ...params, responseType: 'blob' }, ( error, data ) => {
				if ( error || ! ( data instanceof globalThis.Blob ) ) {
					reject( error );
				} else {
					resolve( data );
				}
			} );

		if ( ! maxSize ) {
			return fetchMedia();
		}

		return wpcom.req.get( { ...params, method: 'HEAD' }, ( err, data, headers ) => {
			if ( headers[ 'Content-Length' ] > maxSize ) {
				reject( { message: 'exceeded_max_size' } );
				return;
			}

			fetchMedia();
		} );
	} );
}

export function getAtomicSiteMediaViaProxyRetry( siteId, mediaPath, options ) {
	let retries = 0;
	const request = () =>
		getAtomicSiteMediaViaProxy( siteId, mediaPath, options ).catch( ( error ) => {
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
