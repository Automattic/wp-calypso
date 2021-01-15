/**
 * External dependencies
 */
import { useEffect, useRef } from 'react';

export function useHandleRedirectChangeError( errorCallback: () => void ): void {
	useCallbackOnceForQueryParam( 'error', errorCallback );
}

export function useHandleRedirectChangeComplete( successCallback: () => void ): void {
	useCallbackOnceForQueryParam( 'success', successCallback );
}

function useCallbackOnceForQueryParam( queryParamKey: string, callback: () => void ): void {
	const didRunCallback = useRef< boolean >( false );

	useEffect( () => {
		if ( didRunCallback.current ) {
			return;
		}
		const urlParams = new URLSearchParams( window.location.search );
		const param = urlParams.get( queryParamKey );
		if ( param ) {
			callback();
			didRunCallback.current = true;
		}
	}, [ callback, queryParamKey ] );
}
