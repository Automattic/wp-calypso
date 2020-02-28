/**
 * External dependencies
 */
import React, { useEffect, useState } from 'react';
import { noop } from 'lodash';

/**
 * Internal dependencies
 */
import debugFactory from 'debug';
import { http } from 'state/data-layer/wpcom-http/actions';
import { getHttpData, requestHttpData } from 'state/data-layer/http-data';

const debug = debugFactory( 'calypso:my-sites:media-library:proxied-image' );
const { Blob } = globalThis; // The linter complains if I don't do this...?

const getUrlFromBlob = blob => ( blob instanceof Blob ? URL.createObjectURL( blob ) : undefined );
const fetchProxiedMediaFile = ( siteSlug, mediaUrl ) =>
	http( {
		method: 'GET',
		apiNamespace: 'wpcom/v2',
		path: `/sites/${ siteSlug }/atomic-auth-proxy/file${ mediaUrl }`,
		responseType: 'blob',
	} );

export default function ProxiedImage( {
	alt,
	className,
	mediaUrl,
	onLoad = noop,
	siteSlug,
	style,
} ) {
	const requestId = `media-library-proxied-image-${ siteSlug }${ mediaUrl }`;

	const [ imageObjectUrl, setImageObjectUrl ] = useState( null );

	useEffect( () => {
		if ( imageObjectUrl === null ) {
			const cachedImageBlob = getHttpData( requestId )?.data;
			const url = getUrlFromBlob( cachedImageBlob );
			setImageObjectUrl( url );
			debug( 'set image from cache', { url } );
		}

		requestHttpData( requestId, fetchProxiedMediaFile( siteSlug, mediaUrl ), {
			freshness: 30000,
			fromApi: () => payload => {
				const imageBlob = payload;
				const url = getUrlFromBlob( imageBlob );
				setImageObjectUrl( url );
				debug( 'got image from API', { payload, url } );
				return [ [ requestId, payload ] ];
			},
		} );

		return () => {
			if ( ! imageObjectUrl ) {
				return;
			}
			debug( 'Cleared blob from memory on dismount: ' + imageObjectUrl );
			URL.revokeObjectURL( imageObjectUrl );
		};
	}, [ imageObjectUrl, mediaUrl, requestId, siteSlug ] );

	return (
		<img
			src={ imageObjectUrl }
			onLoad={ onLoad }
			alt={ alt }
			style={ style }
			className={ className }
			draggable="false"
		/>
	);
}
