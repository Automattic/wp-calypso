import { addQueryArgs } from '@wordpress/url';
import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { fetchIsRedirect } from './fetch-is-redirect';

export function mshotsUrl( targetUrl: string, options: MShotsOptions, countToRefresh = 0 ): string {
	return targetUrl;
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
	const [ isLoading, setIsLoading ] = useState( true );
	const [ isError, setIsError ] = useState( false );

	useEffect( () => {
		const img = document.createElement( 'img' ) as HTMLImageElement;

		img.onload = () => {
			setIsLoading( false );
		};

		img.onerror = () => {
			setIsError( true );
			setIsLoading( false );
		};

		img.src = src;
	}, [ src ] );

	return {
		isLoading,
		isError,
		imgProps: {
			src,
			loading: 'lazy',
		},
	};
};
