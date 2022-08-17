import { addQueryArgs } from '@wordpress/url';
import { useState, useEffect, useMemo, useRef } from 'react';

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

export const useMshotsImg = (
	src: string,
	options: MShotsOptions
): {
	src: string;
	isLoading: boolean;
	isError: boolean;
	imgRef: React.MutableRefObject< HTMLImageElement | null >;
} => {
	const [ retryCount, setRetryCount ] = useState( 0 );
	const mshotUrl = useMemo(
		() => mshotsUrl( src, options, retryCount ),
		[ src, options, retryCount ]
	);
	const imgRef = useRef< HTMLImageElement >( null );
	const [ isLoading, setIsLoading ] = useState( true );
	const [ isError, setIsError ] = useState( false );

	useEffect( () => {
		let timeout: number;
		if ( mshotUrl.length > 0 && imgRef?.current && ! imgRef.current.onload ) {
			imgRef.current.onload = () => {
				// MShot Loading image is 400x300px.
				// MShot 404 image is 748×561px
				setIsLoading( true );
				const hasLoadingImgDimensions =
					imgRef?.current?.naturalWidth === 400 && imgRef?.current.naturalHeight === 300;
				if ( ! hasLoadingImgDimensions ) {
					setIsLoading( false );
				} else if ( retryCount < MAXTRIES ) {
					// Only refresh 10 times
					timeout = setTimeout(
						() => setRetryCount( ( retryCount ) => retryCount + 1 ),
						retryCount * 500
					);
				}
			};
			imgRef.current.onerror = () => {
				setIsError( true );
			};
		}
		return () => {
			clearTimeout( timeout );
		};
	}, [ imgRef, mshotUrl, retryCount ] );

	return {
		src: mshotUrl,
		isLoading,
		isError,
		imgRef,
	};
};
