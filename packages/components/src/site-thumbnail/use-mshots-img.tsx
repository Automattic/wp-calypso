import { addQueryArgs } from '@wordpress/url';
import { useState, useEffect, useMemo, useRef, useCallback } from 'react';

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
	const [ retryCount, setRetryCount ] = useState( 0 );
	const { mshotUrl, srcSet } = useMemo( () => {
		const mshotUrl = mshotsUrl( src, options, retryCount );

		// Add retina sizes 2x and 3x.
		const srcSet = [ ...sizes, getRetinaSize( 2, options ), getRetinaSize( 3, options ) ]
			.map( ( { width, height } ) => {
				const resizedUrl = mshotsUrl( src, { ...options, w: width, h: height }, retryCount );
				return `${ resizedUrl } ${ width }w`;
			} )
			.join( ', ' );
		return { mshotUrl, srcSet };
	}, [ src, options, retryCount, sizes ] );

	const [ isLoading, setIsLoading ] = useState( true );
	const [ isError, setIsError ] = useState( false );

	const timeout = useRef< ReturnType< typeof setTimeout > >();

	const onError = useCallback( () => {
		setIsError( true );
	}, [] );

	useEffect( () => {
		async function checkRedirectImage() {
			const response = await fetch( mshotUrl, { method: 'HEAD', redirect: 'manual' } );
			// 307 is the status code for a temporary redirect used by mshots.
			// If we `follow` the redirect, the `response.url` will be 'https://s0.wp.com/mshots/v1/default'
			// and the `response.headers.get('content-type)` will be 'image/gif'
			const isLoading = response.status !== 200;
			setIsLoading( isLoading );
		}

		if ( isLoading && retryCount < MAXTRIES ) {
			// Only refresh 10 times
			timeout.current = setTimeout( () => {
				setRetryCount( ( retryCount ) => retryCount + 1 );
				checkRedirectImage();
			}, retryCount * 500 );
		}
		return () => {
			clearTimeout( timeout.current );
		};
	}, [ isLoading, mshotUrl, retryCount ] );

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
