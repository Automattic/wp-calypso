/**
 * External dependencies
 */
import React, { useState, useEffect, useLayoutEffect } from 'react';
import classnames from 'classnames';
import { addQueryArgs } from '@wordpress/url';

/**
 * Style dependencies
 */
import { isEnabled } from '@automattic/calypso-config';
import './style.scss';

interface MShotsImageProps {
	url: string;
	alt: string;
	'aria-labelledby': string;
	options: MShotsOptions;
	scrollable?: boolean;
}

export type MShotsOptions = {
	vpw: number;
	vph: number;
	w: number;
	h?: number;
	screen_height?: number;
};

export function mshotsUrl( url: string, options: MShotsOptions, count = 0 ): string {
	const mshotsUrl = isEnabled( 'gutenboarding/local-mshots' )
		? 'http://127.0.0.1:8000/mshots/v1/'
		: 'https://s0.wp.com/mshots/v1/';
	const mshotsRequest = addQueryArgs( mshotsUrl + encodeURIComponent( url ), {
		...options,
		count,
	} );
	return mshotsRequest;
}

const MAXTRIES = 10;

// https://stackoverflow.com/a/60458593
const useMshotsUrl = ( src: string, options: MShotsOptions ) => {
	const [ loadedSrc, setLoadedSrc ] = useState( '' );
	const [ count, setCount ] = useState( 0 );

	useEffect( () => {
		const img = new Image();
		const srcUrl = mshotsUrl( src, options, count );
		img.src = srcUrl;
		img.onload = () => {
			// Detect default image (Don't request a 400x300 image).
			if ( img.naturalWidth !== 400 || img.naturalHeight !== 300 ) {
				setLoadedSrc( srcUrl );
			} else {
				// Only refresh 10 times
				count < MAXTRIES &&
					// Triggers a target.src change with increasing timeouts
					setTimeout( () => setCount( count + 1 ), count * 500 );
			}
		};
	}, [ src, count ] );

	return loadedSrc;
};

const MShotsImage = ( {
	url,
	'aria-labelledby': labelledby,
	alt,
	options,
	scrollable = false,
}: MShotsImageProps ): JSX.Element => {
	const [ visible, setVisible ] = useState( true );
	const [ opacity, setOpacity ] = useState( 0 );

	const src = useMshotsUrl( url, options );
	const backgroundImage = src && `url( ${ src } )`;

	// Hide the images while they're loading if src changes (e.g. when locale is switched)
	useLayoutEffect( () => {
		// Opacity is used for fade in on load
		// Visible is used to hide the image quickly when swapping languages
		setVisible( !! src );
		setOpacity( src ? 1 : 0 );
	}, [ src ] );

	const style = {
		opacity,
		backgroundImage,
	};

	const className = classnames(
		'mshots-image__container',
		visible ? 'mshots-image-visible' : 'mshots-image__loader',
		{ scrollable }
	);

	return <div className={ className } style={ style } aria-labelledby={ labelledby } />;
};

export default MShotsImage;
