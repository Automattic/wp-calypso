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

	const onLoad = useCallback(
		( event: React.SyntheticEvent< HTMLImageElement, Event > ) => {
			if ( ! mshotUrl.length ) {
				return;
			}

			setIsLoading( true );
			// Loaded image natural width should conform to sizes passed in.
			const hasExpectedImageDimensions = sizes.some(
				( size ) => size.width === event.currentTarget.naturalWidth
			);
			// MShot Loading image is 400x300px.
			// MShot 404 image is 748×561px
			const hasMshotLoadingImageDimensions =
				event.currentTarget.naturalWidth === 400 && event.currentTarget.naturalHeight === 300;
			const loading = ! hasExpectedImageDimensions || hasMshotLoadingImageDimensions;

			if ( ! loading ) {
				setIsLoading( false );
			} else if ( retryCount < MAXTRIES ) {
				// Only refresh 10 times
				timeout.current = setTimeout(
					() => setRetryCount( ( retryCount ) => retryCount + 1 ),
					retryCount * 500
				);
			}
		},
		[ retryCount, mshotUrl.length, sizes ]
	);

	const onError = useCallback( () => {
		setIsError( true );
	}, [] );

	useEffect( () => {
		clearTimeout( timeout.current );
	}, [ mshotUrl ] );

	return {
		isLoading,
		isError,
		imgProps: {
			onLoad,
			onError,
			srcSet,
			src: mshotUrl,
			loading: 'lazy',
		},
	};
};
