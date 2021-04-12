/**
 * External dependencies
 */
import React, { useState, useEffect } from 'react';
import classnames from 'classnames';
import { addQueryArgs } from '@wordpress/url';

/**
 * Internal dependencies
 */
import { isEnabled } from '@automattic/calypso-config';

/**
 * Style dependencies
 */
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

const cacheBuster = Date.now();

export function mshotsUrl( url: string, options: MShotsOptions, count = 0 ): string {
	const mshotsUrl = isEnabled( 'gutenboarding/local-mshots' )
		? 'http://127.0.0.1:8000/mshots/v1/'
		: 'https://s0.wp.com/mshots/v1/';

	const targetUrl = ! isEnabled( 'gutenboarding/bust-mshots-cache' )
		? url
		: addQueryArgs( url, { cache_buster: cacheBuster } );

	const mshotsRequest = addQueryArgs( mshotsUrl + encodeURIComponent( targetUrl ), {
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

	// Return '' while loading and reset the count for new image requests
	useEffect( () => {
		setLoadedSrc( '' );
		setCount( 0 );
	}, [ src, options ] );

	useEffect( () => {
		const img = new Image();
		const srcUrl = mshotsUrl( src, options, count );
		let timeoutId: number;
		img.src = srcUrl;
		img.onload = () => {
			// Detect default image (Don't request a 400x300 image).
			if ( img.naturalWidth !== 400 || img.naturalHeight !== 300 ) {
				setLoadedSrc( srcUrl );
			} else if ( count < MAXTRIES ) {
				// Only refresh 10 times
				// Triggers a target.src change with increasing timeouts
				timeoutId = setTimeout( () => setCount( count + 1 ), count * 500 );
			}
		};

		return () => {
			img.onload = null;
			clearTimeout( timeoutId );
		};
	}, [ src, count, options ] );

	return loadedSrc;
};

// For hover-scroll, we use a div with a background image (rather than an img element)
// in order to use transitions between `top` and `bottom` on the
// `background-position` property.
// The "normal" top & bottom properties are problematic individually because we
// don't know how big the images will be, and using both gets the
// right positions but with no transition (as they're different properties).
const MShotsImage = ( {
	url,
	'aria-labelledby': labelledby,
	alt,
	options,
	scrollable = false,
}: MShotsImageProps ): JSX.Element => {
	const src = useMshotsUrl( url, options );
	const visible = !! src;
	const backgroundImage = src && `url( ${ src } )`;

	const style = {
		...( scrollable ? { backgroundImage } : {} ),
	};

	const className = classnames(
		'mshots-image__container',
		scrollable && 'hover-scroll',
		visible ? 'mshots-image-visible' : 'mshots-image__loader'
	);

	// The "! visible" here is only to dodge a particularly specific css
	// rule effecting the placeholder while loading static images:
	// '.design-picker .design-picker__image-frame img { ..., height: auto }'
	return scrollable || ! visible ? (
		<div className={ className } style={ style } aria-labelledby={ labelledby } />
	) : (
		<img { ...{ className, style, src, alt } } aria-labelledby={ labelledby } alt={ alt } />
	);
};

export default MShotsImage;
