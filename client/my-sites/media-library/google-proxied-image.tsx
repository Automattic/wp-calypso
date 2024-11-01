import debugFactory from 'debug';
import { useEffect, useState } from 'react';
import { getGoogleMediaViaProxyRetry } from 'calypso/lib/get-google-media';
import type { ComponentType, FC, ReactElement, ReactNode } from 'react';

const debug = debugFactory( 'calypso:my-sites:media-library:google-proxied-image' );

type RenderedComponentProps = {
	src: string;
	[ key: string ]: any;
};
export type RenderedComponent = string | ComponentType< RenderedComponentProps >;

export interface ProxiedImageProps {
	fileUrl: string;
	placeholder?: ReactNode;
	component: RenderedComponent;
	onError?: ( err: Error ) => any;

	[ key: string ]: any;
}

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

const ProxiedImage: FC< ProxiedImageProps > = function ProxiedImage( {
	fileUrl,
	query,
	placeholder = null,
	onError,
	component: Component,
	...rest
} ) {
	const [ imageObjectUrl, setImageObjectUrl ] = useState< string >( '' );

	useEffect( () => {
		const requestId = `media-library-proxied-image-${ fileUrl }${ query }`;

		if ( cache[ requestId ] ) {
			const url = URL.createObjectURL( cache[ requestId ] );
			setImageObjectUrl( url );
			debug( 'set image from cache', { url } );
		} else {
			debug( 'requesting image from API', { requestId, imageObjectUrl } );
			getGoogleMediaViaProxyRetry( fileUrl )
				.then( ( data: unknown ) => {
					const blobData = data as Blob;

					cacheResponse( requestId, blobData );
					setImageObjectUrl( URL.createObjectURL( blobData ) );
					debug( 'got image from API', { requestId, imageObjectUrl, blobData } );
				} )
				.catch( onError );
		}

		return () => {
			if ( imageObjectUrl ) {
				debug( 'Cleared blob from memory on dismount: ' + imageObjectUrl );
				URL.revokeObjectURL( imageObjectUrl );
			}
		};
	}, [ fileUrl, query ] );

	if ( ! imageObjectUrl ) {
		return placeholder as ReactElement;
	}

	return <Component src={ imageObjectUrl } { ...rest } />;
};

export default ProxiedImage;
