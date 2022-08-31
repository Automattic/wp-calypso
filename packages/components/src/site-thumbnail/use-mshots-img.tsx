/* eslint-disable no-console */
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

export const useMshotsImg = (
	src: string,
	options: MShotsOptions
): {
	isLoading: boolean;
	isError: boolean;
	imgProps: Partial< React.ImgHTMLAttributes< HTMLImageElement > >;
} => {
	const [ retryCount, setRetryCount ] = useState( 0 );
	const mshotUrl = useMemo(
		() => mshotsUrl( src, options, retryCount ),
		[ src, options, retryCount ]
	);
	const [ isLoading, setIsLoading ] = useState( true );
	const [ isError, setIsError ] = useState( false );

	const timeout = useRef< ReturnType< typeof setTimeout > >();

	const onLoad = useCallback(
		( event: React.SyntheticEvent< HTMLImageElement, Event > ) => {
			const hasLoadingImgDimensions =
				event.currentTarget.naturalWidth === 400 && event.currentTarget.naturalHeight === 300;
			console.log( 'onLoad: ' + mshotUrl, { event, mshotUrl, hasLoadingImgDimensions } );
			if ( ! mshotUrl.length ) {
				return;
			}
			// MShot Loading image is 400x300px.
			// MShot 404 image is 748×561px
			setIsLoading( true );
			if ( ! hasLoadingImgDimensions ) {
				setIsLoading( false );
			} else if ( retryCount < MAXTRIES ) {
				// Only refresh 10 times
				timeout.current = setTimeout(
					() => setRetryCount( ( retryCount ) => retryCount + 1 ),
					retryCount * 500
				);
			}
		},
		[ retryCount, mshotUrl.length ]
	);

	const onError = useCallback( () => {
		setIsError( true );
	}, [] );

	useEffect( () => {
		clearTimeout( timeout.current );
	}, [ mshotUrl ] );

	console.info( 'useMshotsImg Render: ' + mshotUrl, { mshotUrl, isLoading, isError } );
	return {
		isLoading,
		isError,
		imgProps: { onLoad, onError, src: mshotUrl, loading: 'lazy' },
	};
};
