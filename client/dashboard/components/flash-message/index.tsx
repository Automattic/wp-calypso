import { useDispatch } from '@wordpress/data';
import { store as noticesStore } from '@wordpress/notices';
import { useEffect } from 'react';

interface FlashMessageProps {
	queryParam?: string;
	value: string;
	message: string;
	type?: 'success' | 'error';
}

/**
 * Allows a snackbar to be shown on page load based on a query parameter.
 * Clears the query parameter when done.
 */
export default function FlashMessage( {
	queryParam = 'updated',
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
		if ( params.get( queryParam ) === value ) {
			switch ( type ) {
				case 'error':
					createErrorNotice( message, { type: 'snackbar' } );
					break;
				case 'success':
					createSuccessNotice( message, { type: 'snackbar' } );
					break;
			}

			params.delete( queryParam );
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
