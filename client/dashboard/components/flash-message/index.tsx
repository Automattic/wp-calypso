import { useDispatch } from '@wordpress/data';
import { store as noticesStore } from '@wordpress/notices';
import { useEffect } from 'react';

interface FlashMessageProps {
	overrideDefaultParam?: string;
	value: string;
	message: string;
	type?: 'success' | 'error';
}

const DEFAULT_PARAM_NAME = 'show-flash-message';

export function addParamForFlashMessage(
	queryParams: any,
	overrideDefaultParam: string = DEFAULT_PARAM_NAME
): object {
	if ( typeof queryParams !== 'object' ) {
		queryParams = {};
	}
	queryParams[ overrideDefaultParam ] = true;
	return queryParams;
}
/**
 * Allows a snackbar to be shown on page load based on a query parameter.
 * Clears the query parameter when done.
 */
export default function FlashMessage( {
	overrideDefaultParam = DEFAULT_PARAM_NAME,
	value,
	message,
	type = 'success',
}: FlashMessageProps ) {
	const { createSuccessNotice, createErrorNotice } = useDispatch( noticesStore );

	useEffect( () => {
		if ( typeof window === 'undefined' ) {
			return;
		}
		const params = new URLSearchParams( window.location.search );
		if ( params.get( overrideDefaultParam ) === value ) {
			switch ( type ) {
				case 'error':
					createErrorNotice( message, { type: 'snackbar' } );
					break;
				case 'success':
					createSuccessNotice( message, { type: 'snackbar' } );
					break;
			}

			params.delete( overrideDefaultParam );
			const newUrl =
				window.location.pathname + ( params.toString() ? '?' + params.toString() : '' );
			window.history.replaceState( {}, '', newUrl );
		}

		// This effect has side effects, like editing the URL. We only ever
		// want to run it once on mount.
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [] );

	return null;
}
