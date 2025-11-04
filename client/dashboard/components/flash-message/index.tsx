import { useDispatch } from '@wordpress/data';
import { store as noticesStore } from '@wordpress/notices';
import { addQueryArgs } from '@wordpress/url';
import { useEffect } from 'react';

interface FlashMessageProps {
	id: string;
	message: string;
	type?: 'success' | 'error';
}

const PARAM_NAME = 'flash';

export function reloadWithFlashMessage( messageId: string ) {
	const newUrl = addQueryArgs( window.location.href, { [ PARAM_NAME ]: messageId } );
	window.location.replace( newUrl );
}

/**
 * Allows a snackbar to be shown on page load based on a query parameter.
 * Clears the query parameter when done.
 */
export default function FlashMessage( { id, message, type = 'success' }: FlashMessageProps ) {
	const { createSuccessNotice, createErrorNotice } = useDispatch( noticesStore );

	useEffect( () => {
		if ( typeof window === 'undefined' ) {
			return;
		}
		const params = new URLSearchParams( window.location.search );
		if ( params.get( PARAM_NAME ) === id ) {
			switch ( type ) {
				case 'error':
					createErrorNotice( message, { type: 'snackbar' } );
					break;
				case 'success':
					createSuccessNotice( message, { type: 'snackbar' } );
					break;
			}

			params.delete( PARAM_NAME );
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
