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
import { exponentialBackoff } from 'state/data-layer/wpcom-http/pipeline/retry-on-failure/policies';

const debug = debugFactory( 'calypso:my-sites:media-library:proxied-image' );
const { Blob } = globalThis; // The linter complains if I don't do this...?

const getUrlFromBlob = ( blob: Blob ) =>
	blob instanceof Blob ? URL.createObjectURL( blob ) : undefined;

const fetchProxiedMediaFile = ( siteSlug: string, src: string, query: string ) =>
	http( {
		method: 'GET',
		apiNamespace: 'wpcom/v2',
		path: `/sites/${ siteSlug }/atomic-auth-proxy/file${ src }${ query }`,
		responseType: 'blob',
		retryPolicy: exponentialBackoff( { delay: 1, maxAttempts: 2 } ),
		// To quiet down the warning:
		onSuccess: noop,
	} );

interface Props {
	query: string;
	filePath: string;
	siteSlug: string;

	[ key: string ]: any;
}

const ProxiedImage: React.FC< Props > = function ProxiedImage( {
	siteSlug,
	filePath,
	query,
	...rest
} ) {
	const [ imageObjectUrl, setImageObjectUrl ] = useState( null );
	const requestId = `media-library-proxied-image-${ siteSlug }${ filePath }`;

	useEffect( () => {
		if ( imageObjectUrl === null ) {
			const cachedImageBlob = getHttpData( requestId )?.data;
			const url = getUrlFromBlob( cachedImageBlob );
			setImageObjectUrl( url );
			debug( 'set image from cache', { url } );
		}

		requestHttpData( requestId, fetchProxiedMediaFile( siteSlug, filePath, query ), {
			freshness: 30000,
			fromApi: () => payload => {
				setImageObjectUrl( getUrlFromBlob( payload ) );
				debug( 'got image from API', { payload } );
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
	}, [ imageObjectUrl, filePath, requestId, siteSlug ] );

	/* eslint-disable-next-line jsx-a11y/alt-text */
	return <img src={ imageObjectUrl } { ...rest } />;
};

export default ProxiedImage;
