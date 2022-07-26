import { addQueryArgs } from '@wordpress/url';
import { useState, useEffect, useMemo, useRef } from 'react';

export function mshotsUrl( targetUrl: string, options: MShotsOptions ): string {
	if ( ! targetUrl ) {
		return '';
	}
	const mshotsUrl = 'https://s0.wp.com/mshots/v1/';
	const mshotsRequest = addQueryArgs( mshotsUrl + encodeURIComponent( targetUrl ), options );
	return mshotsRequest;
}

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
	imgRef: React.MutableRefObject< HTMLImageElement | null >;
} => {
	const mshotUrl = useMemo( () => mshotsUrl( src, options ), [ src, options ] );
	const imgRef = useRef< HTMLImageElement >( null );
	const [ isLoading, setIsLoading ] = useState( true );

	useEffect( () => {
		if ( mshotUrl.length > 0 && imgRef?.current && ! imgRef.current.onload ) {
			imgRef.current.onload = () => {
				setIsLoading( false );
			};
		}
	}, [ imgRef, mshotUrl ] );

	return {
		src: mshotUrl,
		isLoading,
		imgRef,
	};
};
