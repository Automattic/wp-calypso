/**
 * External dependencies
 */
import React, { useState, useEffect, useRef } from 'react';
import classnames from 'classnames';
import { addQueryArgs } from '@wordpress/url';
import debugFactory from 'debug';

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

const debug = debugFactory( 'design-picker:mshots-image' );
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
	const previousSrc = useRef( src );
	const previousImg = useRef< HTMLImageElement >();
	const previousOptions = useRef< MShotsOptions >();
	// Oddly, we need to assign to current here after ref creation in order to
	// pass the equivalence check and avoid a spurious reset
	previousOptions.current = options;

	// Note: Mshots doesn't care about the "count" param, but it is important
	// to browser caching. Getting this wrong looks like the url resolving
	// before the image is ready.

	useEffect( () => {
		const img = new Image();
		// If there's been a "props" change we need to reset everything:
		if ( options !== previousOptions.current || src !== previousSrc.current ) {
			// Make sure an old image can't trigger a spurious state update
			debug( 'resetting mShotsUrl request' );
			if ( src !== previousSrc.current ) {
				debug( 'src changed\nfrom', previousSrc.current, '\nto', src );
			}
			if ( options !== previousOptions.current ) {
				debug( 'options changed\nfrom', previousOptions.current, '\nto', options );
			}
			previousImg.current && previousImg.current.onload && ( previousImg.current.onload = null );

			setLoadedSrc( '' );
			setCount( 0 );
			previousImg.current = img;
			previousOptions.current = options;
			previousSrc.current = src;
		}
		const srcUrl = mshotsUrl( src, options, count );
		let timeoutId: number;
		img.onload = () => {
			// Detect default image (Don't request a 400x300 image).
			//
			// If this turns out to be a problem, it might help to know that the
			// http request status for the default is a 307. Unfortunately we
			// don't get the request through an img element so we'd need to
			// take a completely different approach using ajax.
			if ( img.naturalWidth !== 400 || img.naturalHeight !== 300 ) {
				setLoadedSrc( srcUrl );
			} else if ( count < MAXTRIES ) {
				// Only refresh 10 times
				// Triggers a target.src change with increasing timeouts
				timeoutId = setTimeout( () => setCount( count + 1 ), count * 500 );
			}
		};
		img.src = srcUrl;

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
