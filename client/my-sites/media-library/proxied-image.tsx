/**
 * External dependencies
 */
import React, { useEffect, useState } from 'react';

/**
 * Internal dependencies
 */
import debugFactory from 'debug';
import wpcom from 'lib/wp';

const debug = debugFactory( 'calypso:my-sites:media-library:proxied-image' );
const { Blob } = globalThis; // The linter complains if I don't do this...?

interface Props {
	query: string;
	filePath: string;
	siteSlug: string;

	[ key: string ]: any;
}

const cache: { [ key: string ]: Blob } = {};
const cacheResponse = ( requestId: string, blob: Blob, freshness = 30000 ) => {
	cache[ requestId ] = blob;
	setTimeout( () => {
		delete cache[ requestId ];
	}, freshness );
};

const ProxiedImage: React.FC< Props > = function ProxiedImage( {
	siteSlug,
	filePath,
	query,
	...rest
} ) {
	const [ imageObjectUrl, setImageObjectUrl ] = useState< string >( '' );
	const requestId = `media-library-proxied-image-${ siteSlug }${ filePath }${ query }`;

	useEffect( () => {
		if ( imageObjectUrl === '' && cache[ requestId ] ) {
			const url = URL.createObjectURL( cache[ requestId ] );
			setImageObjectUrl( url );
			debug( 'set image from cache', { url } );
		} else {
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
							debug( 'got image from API', { data } );
						}
					}
				);
		}

		return () => {
			if ( imageObjectUrl ) {
				debug( 'Cleared blob from memory on dismount: ' + imageObjectUrl );
				URL.revokeObjectURL( imageObjectUrl );
			}
		};
	}, [ imageObjectUrl, filePath, requestId, siteSlug ] );

	if ( ! imageObjectUrl ) {
		return false;
	}

	/* eslint-disable-next-line jsx-a11y/alt-text */
	return <img src={ imageObjectUrl } { ...rest } />;
};

export default ProxiedImage;
