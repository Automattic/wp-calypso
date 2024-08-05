import { addQueryArgs } from '@wordpress/url';
import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { fetchAwaitRedirect } from './fetch-await-redirect';

export function mshotsUrl( targetUrl: string, options: MShotsOptions, countToRefresh = 0 ): string {
	if ( ! targetUrl ) {
		return '';
	}
	const mshotsUrl = 'https://s0.wp.com/mshots/v1/';
	const mshotsRequest = addQueryArgs( mshotsUrl + encodeURIComponent( targetUrl ), {
		...options,
		countToRefresh,
	} );
	return mshotsRequest;
}
const MAXTRIES = 10;

export type MShotsOptions = {
	vpw: number;
	vph: number;
	w: number;
	h?: number;
	screen_height?: number;
	requeue?: boolean;
	/**
	 * If true, the current user agent will be forwarded to the target site to mimic the user themselves viewing the site.
	 */
	forward_user_agent?: boolean;
};

function getRetinaSize( multiply: number, { w, h }: MShotsOptions ) {
	return {
		width: w * multiply,
		height: ( h || w ) * multiply,
	};
}

export const useMshotsImg = (
	src: string,
	options: MShotsOptions,
	sizes: Array< {
		width: number;
		height?: number;
	} > = []
): {
	isLoading: boolean;
	isError: boolean;
	imgProps: Partial< React.ImgHTMLAttributes< HTMLImageElement > >;
} => {
	const [ previousSrc, setPreviousSrc ] = useState( src );
	const srcHasChanged = src !== previousSrc;

	const [ retryCount, setRetryCount ] = useState( 0 );
	const { mshotUrl, srcSet } = useMemo( () => {
		// If the src has changed, the retry count will be reset
		// and we want to avoid caching the mshot loading the image
		const count = srcHasChanged ? -1 : retryCount;
		const mshotUrl = mshotsUrl( src, options, count );

		// Add retina sizes 2x and 3x.
		const srcSet = [ ...sizes, getRetinaSize( 2, options ), getRetinaSize( 3, options ) ]
			.map( ( { width, height } ) => {
				const resizedUrl = mshotsUrl( src, { ...options, w: width, h: height }, count );
				return `${ resizedUrl } ${ width }w`;
			} )
			.join( ', ' );
		return { mshotUrl, srcSet };
	}, [ srcHasChanged, retryCount, src, options, sizes ] );

	const [ isLoading, setIsLoading ] = useState( true );
	const [ isError, setIsError ] = useState( false );

	const timeout = useRef< ReturnType< typeof setTimeout > >();

	const onError = useCallback( () => {
		setIsError( true );
	}, [] );

	useEffect( () => {
		if ( ! src ) {
			return;
		}

		async function checkRedirectImage() {
			try {
				const { isError, isRedirect } = await fetchAwaitRedirect( mshotUrl );
				if ( ! timeout.current ) {
					return;
				}
				if ( isError ) {
					setIsLoading( false );
					setIsError( true );
				}
				// 307 is the status code for a temporary redirect used by mshots.
				// If we `follow` the redirect, the `response.url` will be 'https://s0.wp.com/mshots/v1/default'
				// and the `response.headers.get('content-type)` will be 'image/gif'
				if ( ! isRedirect ) {
					setIsLoading( false );
				}
			} catch ( e ) {
				setIsLoading( false );
				setIsError( true );
			}
		}

		if ( isLoading && retryCount < MAXTRIES ) {
			// Only refresh 10 times
			timeout.current = setTimeout( () => {
				setRetryCount( ( retryCount ) => retryCount + 1 );
				checkRedirectImage();
			}, retryCount * 600 );
		}

		return () => {
			if ( timeout.current ) {
				clearTimeout( timeout.current );
			}
		};
	}, [ isLoading, mshotUrl, retryCount, src ] );

	useEffect( () => {
		// Reset state when the image src changes. e.g. When the site is updated
		if ( srcHasChanged ) {
			setIsLoading( true );
			setRetryCount( 0 );
			setPreviousSrc( src );
		}
	}, [ src, srcHasChanged ] );

	return {
		isLoading,
		isError,
		imgProps: {
			onError,
			srcSet,
			src: mshotUrl,
			loading: 'lazy',
		},
	};
};
