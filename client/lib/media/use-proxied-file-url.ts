/**
 * External dependencies
 */
import { useEffect, useState } from 'react';

const { Blob } = globalThis; // The linter complains if I don't do this...?

/**
 * Internal dependencies
 */
import wpcom from 'lib/wp';
import debugFactory from 'debug';

const debug = debugFactory( 'calypso:my-sites:media-library:proxied-image' );

const cache: { [ key: string ]: Blob } = {};
const cacheResponse = ( requestId: string, blob: Blob, freshness = 60000 ) => {
	// Cache at most 100 items
	const cacheKeys = Object.keys( cache );
	if ( cacheKeys.length > 100 ) {
		delete cache[ cacheKeys[ 0 ] ];
	}

	cache[ requestId ] = blob;

	// Self-remove this entry after `freshness` ms
	setTimeout( () => {
		delete cache[ requestId ];
	}, freshness );
};

export function useProxiedFileUrl ( filePath: string, siteSlug: string, query = "" ) {
	const [error, setError] = useState<Error | null>( null );
	const [loading, setLoading] = useState<boolean>( true );
	const [imageObjectUrl, setImageObjectUrl] = useState<string>( '' );
	const requestId = `media-library-proxied-file-${siteSlug}${filePath}${query}`;

	useEffect( () => {
		if ( !imageObjectUrl ) {
			if ( cache[ requestId ] ) {
				const url = URL.createObjectURL( cache[ requestId ] );
				setImageObjectUrl( url );
				debug( 'set image from cache', { url } );
				setLoading( false );
			} else {
				debug( 'requesting image from API', { requestId, imageObjectUrl } );
				wpcom
					.undocumented()
					.getAtomicSiteMediaViaProxyRetry(
						siteSlug,
						filePath,
						query,
						( err: Error, data: Blob | null ) => {
							if ( data instanceof Blob ) {
								cacheResponse( requestId, data );
								setImageObjectUrl( URL.createObjectURL( data ) );
								debug( 'got image from API', { requestId, imageObjectUrl, data } );
							} else {
								setError( err );
							}
							setLoading( false );
						},
					);
			}
		}

		return () => {
			if ( imageObjectUrl ) {
				debug( 'Cleared blob from memory on dismount: ' + imageObjectUrl );
				URL.revokeObjectURL( imageObjectUrl );
				setImageObjectUrl( "" );
			}
		};
	}, [filePath, requestId, siteSlug] );

	return [imageObjectUrl, loading, error];
}

