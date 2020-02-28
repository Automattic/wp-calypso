/**
 * External dependencies
 */
import React, { useEffect, useState } from 'react';
import { noop } from 'lodash';

/**
 * Internal dependencies
 */
import { http } from 'state/data-layer/wpcom-http/actions';
import { requestHttpData } from 'state/data-layer/http-data';

const { Blob } = globalThis; // The linter complains if I don't do this...?

export default function ProxiedImage( { alt, mediaUrl, onLoad = noop, siteSlug, style } ) {
	const [ imageData, setImageData ] = useState( null );

	const requestId = `media-library-proxied-image-${ siteSlug }${ mediaUrl }`;

	useEffect( () => {
		requestHttpData(
			requestId,
			http( {
				method: 'GET',
				apiNamespace: 'wpcom/v2',
				path: `/sites/${ siteSlug }/atomic-auth-proxy/file${ mediaUrl }`,
				responseType: 'blob',
			} ),
			{
				fromApi: () => payload => {
					const blobUrl = payload instanceof Blob ? URL.createObjectURL( payload ) : undefined;
					setImageData( blobUrl );
					return [ [ requestId, payload ] ];
				},
			}
		);

		// Make sure stored Blobs get cleared from memory when the component dismounts
		return () => imageData && URL.revokeObjectURL( imageData );
	}, [ imageData, mediaUrl, requestId, siteSlug ] );

	return (
		<img
			src={ imageData }
			onLoad={ onLoad }
			alt={ alt }
			style={ style }
			className="media-library__list-item-centered"
			draggable="false"
		/>
	);
}
