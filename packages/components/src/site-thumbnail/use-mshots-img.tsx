import { addQueryArgs } from '@wordpress/url';
import { useState, useEffect, useRef } from 'react';

export function mshotsUrl( targetUrl: string, options: MShotsOptions, count = 0 ): string {
	if ( ! targetUrl ) {
		return '';
	}
	const mshotsUrl = 'https://s0.wp.com/mshots/v1/';
	const mshotsRequest = addQueryArgs( mshotsUrl + encodeURIComponent( targetUrl ), {
		...options,
		count,
	} );
	return mshotsRequest;
}

const MAXTRIES = 10;

type MShotsOptions = {
	vpw: number;
	vph: number;
	w: number;
	h?: number;
	screen_height?: number;
};

// This custom react hook returns undefined while the image is loading and
// a HTMLImageElement (i.e. the class you get from `new Image()`) once loading
// is complete.
//
// It also triggers a re-render (via setState()) when the value changes, so just
// check if it's truthy and then treat it like any other Image.
//
// Note the loading may occur immediately and synchronously if the image is
// already or may take up to several seconds if mshots has to generate and cache
// new images.
//
// The calling code doesn't need to worry about the details except that you'll
// want some sort of loading display.
//
// Inspired by https://stackoverflow.com/a/60458593
export const useMshotsImg = (
	src: string,
	options: MShotsOptions
): HTMLImageElement | undefined => {
	const [ loadedImg, setLoadedImg ] = useState< HTMLImageElement >();
	const [ count, setCount ] = useState( 0 );
	const previousSrc = useRef( src );

	const imgRef = useRef< HTMLImageElement >();
	const timeoutIdRef = useRef< number >();

	const previousImg = useRef< HTMLImageElement >();
	const previousOptions = useRef< MShotsOptions >();
	// Oddly, we need to assign to current here after ref creation in order to
	// pass the equivalence check and avoid a spurious reset
	previousOptions.current = options;

	// Note: Mshots doesn't care about the "count" param, but it is important
	// to browser caching. Getting this wrong looks like the url resolving
	// before the image is ready.
	useEffect( () => {
		if ( src.length === 0 ) {
			return;
		}

		// If there's been a "props" change we need to reset everything:
		if (
			options !== previousOptions.current ||
			( src !== previousSrc.current && imgRef.current )
		) {
			// Make sure an old image can't trigger a spurious state update
			if ( previousImg.current && previousImg.current.onload ) {
				previousImg.current.onload = null;
				if ( timeoutIdRef.current ) {
					clearTimeout( timeoutIdRef.current );
					timeoutIdRef.current = undefined;
				}
			}

			setLoadedImg( undefined );
			setCount( 0 );
			previousImg.current = imgRef.current;

			previousOptions.current = options;
			previousSrc.current = src;
		}

		const srcUrl = mshotsUrl( src, options, count );
		const newImage = new Image();
		newImage.onload = () => {
			// Detect default image (Don't request a 400x300 image).
			//
			// If this turns out to be a problem, it might help to know that the
			// http request status for the default is a 307. Unfortunately we
			// don't get the request through an img element so we'd need to
			// take a completely different approach using ajax.
			if ( newImage.naturalWidth !== 400 || newImage.naturalHeight !== 300 ) {
				// Note we're using the naked object here, not the ref, because
				// this is the callback on the image itself. We'd never want
				// the image to finish loading and set some other image.
				setLoadedImg( newImage );
			} else if ( count < MAXTRIES ) {
				// Only refresh 10 times
				// Triggers a target.src change with increasing timeouts
				timeoutIdRef.current = setTimeout( () => setCount( ( count ) => count + 1 ), count * 500 );
			}
		};
		newImage.src = srcUrl;
		imgRef.current = newImage;

		return () => {
			if ( imgRef.current && imgRef.current.onload ) {
				imgRef.current.onload = null;
			}
			clearTimeout( timeoutIdRef.current );
		};
	}, [ src, count, options ] );

	return loadedImg;
};
