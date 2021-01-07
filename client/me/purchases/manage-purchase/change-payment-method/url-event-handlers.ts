/**
 * External dependencies
 */
import { useEffect } from 'react';
import { TranslateResult } from 'i18n-calypso';

/**
 * Internal Dependencies
 */
import notices from 'calypso/notices';

export function useDisplayErrorMessageFromUrl( errorMessage: string | TranslateResult ): void {
	useEffect( () => {
		const urlParams = new URLSearchParams( window.location.search );
		const errorParam = urlParams.get( 'error' );
		if ( errorParam ) {
			notices.error( errorMessage );
		}
	}, [] ); // eslint-disable-line react-hooks/exhaustive-deps
}

export function useHandleRedirectChangeComplete( successCallback: () => void ): void {
	useEffect( () => {
		const urlParams = new URLSearchParams( window.location.search );
		const errorParam = urlParams.get( 'success' );
		if ( errorParam ) {
			successCallback();
		}
	}, [] ); // eslint-disable-line react-hooks/exhaustive-deps
}
