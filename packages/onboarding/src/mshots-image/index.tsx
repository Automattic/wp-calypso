import { addQueryArgs } from '@wordpress/url';
import clsx from 'clsx';
import debugFactory from 'debug';
import { useState, useEffect, useRef } from 'react';

import './style.scss';

interface MShotsImageProps {
	url: string;
	alt: string;
	'aria-labelledby': string;
	options: MShotsOptions;
	scrollable?: boolean;
	loading?: 'lazy' | 'eager';
}

export type MShotsOptions = {
	vpw: number;
	vph: number;
	w: number;
	h?: number;
	screen_height?: number;
	format?: 'png' | 'jpeg';
	oldHighResImageLoading?: boolean;
};

const debug = debugFactory( 'design-picker:mshots-image' );

export function mshotsUrl( targetUrl: string, options: MShotsOptions, count = 0 ): string {
	const mshotsUrl = 'https://s0.wp.com/mshots/v1/';
	const mshotsRequest = addQueryArgs( mshotsUrl + encodeURIComponent( targetUrl ), {
		...options,
		count,
	} );
	return mshotsRequest;
}

const MAXTRIES = 10;

// This custom react hook returns null while the image is loading and the page
// (not image) URL once loading is complete.
//
// It also triggers a re-render (via setState()) when the value changes, so just
// check that the requested URL matches the returned URL.
//
// Note the loading may occur immediately if the image is already available, or
// may take several seconds if mshots has to generate and cache new images.
//
// The calling code doesn't need to worry about the details except that you'll
// want some sort of loading display.
//
// Inspired by https://stackoverflow.com/a/60458593
const useMshotsImg = (
	src: string,
	options: MShotsOptions,
	imgRef: React.MutableRefObject< HTMLImageElement | null >
): string | null => {
	const [ loadedImg, setLoadedImg ] = useState< string | null >( null );
	const [ count, setCount ] = useState( 0 );
	const previousSrc = useRef( src );

	const timeoutIdRef = useRef< number >();

	const previousImg = useRef< HTMLImageElement | null >( null );
	const previousOptions = useRef< MShotsOptions >();
	// Oddly, we need to assign to current here after ref creation in order to
	// pass the equivalence check and avoid a spurious reset
	previousOptions.current = options;

	// Note: Mshots doesn't care about the "count" param, but it is important
	// to browser caching. Getting this wrong looks like the url resolving
	// before the image is ready.
	useEffect( () => {
		// If there's been a "props" change we need to reset everything:
		if (
			options !== previousOptions.current ||
			( src !== previousSrc.current && imgRef.current )
		) {
			// Make sure an old image can't trigger a spurious state update
			debug( 'resetting mShotsUrl request' );
			if ( src !== previousSrc.current ) {
				debug( 'src changed\nfrom', previousSrc.current, '\nto', src );
			}
			if ( options !== previousOptions.current ) {
				debug( 'options changed\nfrom', previousOptions.current, '\nto', options );
			}
			if ( previousImg.current && previousImg.current.onload ) {
				previousImg.current.onload = null;
				if ( timeoutIdRef.current ) {
					clearTimeout( timeoutIdRef.current );
					timeoutIdRef.current = undefined;
				}
			}

			setCount( 0 );
			if ( previousImg.current !== imgRef.current ) {
				previousImg.current = imgRef.current;
			}

			previousOptions.current = options;
			previousSrc.current = src;
		}

		const srcUrl = mshotsUrl( src, options, count );

		if ( imgRef.current ) {
			imgRef.current.onload = () => {
				// Detect default image (Don't request a 400x300 image).
				//
				// If this turns out to be a problem, it might help to know that the
				// http request status for the default is a 307. Unfortunately we
				// don't get the request through an img element so we'd need to
				// take a completely different approach using ajax.
				if ( imgRef.current?.naturalWidth !== 400 || imgRef.current?.naturalHeight !== 300 ) {
					setLoadedImg( src );
				} else if ( count < MAXTRIES ) {
					// Only refresh 10 times
					// Triggers a target.src change with increasing timeouts
					timeoutIdRef.current = window.setTimeout(
						() => setCount( ( count ) => count + 1 ),
						count * 500
					);
				}
			};
			imgRef.current.src = srcUrl;
		}

		return () => {
			if ( imgRef.current && imgRef.current.onload ) {
				imgRef.current.onload = null;
			}
			if ( previousImg.current && previousImg.current.onload ) {
				previousImg.current.onload = null;
			}
			clearTimeout( timeoutIdRef.current );
		};
	}, [ src, count, options, imgRef ] );

	return loadedImg;
};

// Temporary for A/B test.
const useMshotsImgTreatment = (
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
		// If there's been a "props" change we need to reset everything:
		if (
			options !== previousOptions.current ||
			( src !== previousSrc.current && imgRef.current )
		) {
			// Make sure an old image can't trigger a spurious state update
			debug( 'resetting mShotsUrl request' );
			if ( src !== previousSrc.current ) {
				debug( 'src changed\nfrom', previousSrc.current, '\nto', src );
			}
			if ( options !== previousOptions.current ) {
				debug( 'options changed\nfrom', previousOptions.current, '\nto', options );
			}
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
				timeoutIdRef.current = window.setTimeout(
					() => setCount( ( count ) => count + 1 ),
					count * 500
				);
			}
		};
		newImage.src = srcUrl;
		newImage.loading = 'lazy';
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

const MShotsImageControl = ( {
	url,
	'aria-labelledby': labelledby,
	alt,
	options,
	scrollable = false,
	loading = 'lazy',
}: MShotsImageProps ) => {
	const imgRef = useRef< HTMLImageElement | null >( null );
	const currentlyLoadedUrl = useMshotsImg( url, options, imgRef );
	const src: string = imgRef.current?.src || '';
	const visible = src && url === currentlyLoadedUrl;
	const backgroundImage = src && `url( ${ src } )`;

	const animationScrollSpeedInPixelsPerSecond = 400;
	const animationDuration =
		( imgRef.current?.naturalHeight || 600 ) / animationScrollSpeedInPixelsPerSecond;

	const scrollableStyles = {
		backgroundImage,
		transition: `background-position ${ animationDuration }s`,
	};

	const style = {
		...( scrollable ? scrollableStyles : {} ),
	};

	const className = clsx(
		'mshots-image__container',
		scrollable && 'hover-scroll',
		visible ? 'mshots-image-visible' : 'mshots-image__loader'
	);

	if ( options?.oldHighResImageLoading ) {
		return scrollable ? (
			<div className={ className } style={ style } aria-labelledby={ labelledby }>
				<img ref={ imgRef } className="mshots-dummy-image" aria-hidden="true" alt="" />
			</div>
		) : (
			<img
				ref={ imgRef }
				{ ...{ className, style, src, alt } }
				aria-labelledby={ labelledby }
				alt={ alt }
			/>
		);
	} // else, prettier doesn't like having an else after a return
	return scrollable ? (
		<div className={ className } style={ style } aria-labelledby={ labelledby }>
			<img
				ref={ imgRef }
				loading={ loading }
				className="mshots-dummy-image"
				aria-hidden="true"
				alt=""
			/>
		</div>
	) : (
		<img
			loading={ loading }
			ref={ imgRef }
			{ ...{ className, style, src, alt } }
			aria-labelledby={ labelledby }
			alt={ alt }
		/>
	);
};

// Temporary for A/B test.
const MShotsImageTreatment = ( {
	url,
	'aria-labelledby': labelledby,
	alt,
	options,
	scrollable = false,
	loading,
}: MShotsImageProps ) => {
	const maybeImage = useMshotsImgTreatment( url, options );
	const src: string = maybeImage?.src || '';
	const visible = !! src;
	const backgroundImage = maybeImage?.src && `url( ${ maybeImage?.src } )`;

	const animationScrollSpeedInPixelsPerSecond = 400;
	const animationDuration =
		( maybeImage?.naturalHeight || 600 ) / animationScrollSpeedInPixelsPerSecond;

	const scrollableStyles = {
		backgroundImage,
		transition: `background-position ${ animationDuration }s`,
	};

	const style = {
		...( scrollable ? scrollableStyles : {} ),
	};

	const className = clsx(
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
		<img
			{ ...{ className, style, src, alt } }
			loading={ loading }
			aria-labelledby={ labelledby }
			alt={ alt }
		/>
	);
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
	loading = 'lazy',
}: MShotsImageProps ) => {
	// Return MShotsImageControl or MShotsImageTreatment depending on options.oldHighResImageLoading
	if ( options?.oldHighResImageLoading ) {
		return (
			<MShotsImageTreatment
				url={ url }
				aria-labelledby={ labelledby }
				alt={ alt }
				options={ options }
				scrollable={ scrollable }
				loading={ loading }
			/>
		);
	}
	return (
		<MShotsImageControl
			url={ url }
			aria-labelledby={ labelledby }
			alt={ alt }
			options={ options }
			scrollable={ scrollable }
			loading={ loading }
		/>
	);
};

export default MShotsImage;
