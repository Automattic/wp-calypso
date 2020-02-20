/**
 * External dependencies
 */
import React, { useEffect, useState } from 'react';
import { noop } from 'lodash';

/**
 * Internal dependencies
 */
import wpcom from 'lib/wp';

export default function( { alt, mediaUrl, onLoad = noop, siteSlug, style } ) {
	const [ imageData, setImageData ] = useState( null );

	useEffect( () => {
		if ( imageData !== null ) {
			return;
		}

		wpcom.undocumented().getAtomicSiteMediaViaProxy( siteSlug, mediaUrl, ( err, data ) => {
			if ( ! ( data instanceof Blob ) ) {
				setImageData( false );
				return;
			}

			const imageUrl = URL.createObjectURL( data );
			setImageData( imageUrl );
		} );
	} );

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
