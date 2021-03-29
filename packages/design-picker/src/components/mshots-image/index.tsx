/**
 * External dependencies
 */
import React, { useState, useLayoutEffect } from 'react';
import classnames from 'classnames';
import { addQueryArgs } from '@wordpress/url';

/**
 * Style dependencies
 */
import './style.scss';

interface MShotsImageProps {
	url: string;
	alt: string;
	'aria-labelledby': string;
	options: MShotsOptions;
}

export type MShotsOptions = {
	vpw: number;
	vph: number;
	w: number;
	h: number;
};

export function mshotsUrl( url: string, options: MShotsOptions, count = 0 ): string {
	const mshotsUrl = 'https://s0.wp.com/mshots/v1/';
	const mshotsRequest = addQueryArgs( mshotsUrl + encodeURIComponent( url ), {
		...options,
		count,
	} );
	return mshotsRequest;
}

const MAXTRIES = 10;

const MShotsImage = ( {
	url,
	'aria-labelledby': labelledby,
	alt,
	options,
}: MShotsImageProps ): JSX.Element => {
	const [ count, setCount ] = React.useState( 1 );
	const [ visible, setVisible ] = useState( false );
	const [ opacity, setOpacity ] = useState( 0 );

	const src = mshotsUrl( url, options, count );

	// Hide the images while they're loading if src changes (e.g. when locale is switched)
	useLayoutEffect( () => {
		// Opacity is used for fade in on load
		// Visible is used to hide the image quickly when swapping languages
		setVisible( false );
		setOpacity( 0 );
	}, [ src, setVisible, setOpacity ] );

	return (
		<div className="mshots-image__container">
			{ ! visible && <div className="mshots-image__loader"></div> }
			<img
				className={ classnames(
					'mshots-image',
					visible ? 'mshots-image-visible' : 'mshots-image-hidden'
				) }
				style={ { opacity: opacity } }
				alt={ alt }
				aria-labelledby={ labelledby }
				src={ src }
				onLoad={ ( e ) => {
					// Test mshots h value matches the desired image
					// The default image (https://s0.wp.com/mshots/v1/default) is around 400x300 px h
					// but sometimes slightly off (e.g. h: 299.99)
					if ( e.currentTarget.naturalHeight !== options.h ) {
						// Only refresh 10 times
						if ( count < MAXTRIES ) {
							// Triggers a target.src change and image refresh @ 500ms, 1000ms, 1500ms...
							setTimeout( () => setCount( count + 1 ), count * 500 );
						}
					} else {
						// Show the image / hide loader
						setVisible( true );
						// Fade in
						setOpacity( 1 );
					}
				} }
			/>
		</div>
	);
};

export default MShotsImage;
