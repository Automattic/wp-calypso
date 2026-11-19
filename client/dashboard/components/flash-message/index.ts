import { useDispatch } from '@wordpress/data';
import { store as noticesStore } from '@wordpress/notices';
import { addQueryArgs } from '@wordpress/url';
import { useConsumeSearchParams } from '../../app/hooks/use-consume-search-params';

interface FlashMessageProps {
	id: string;
	message: string;
	type?: 'success' | 'error';
}

export const FLASH_QUERY_PARAM = 'flash';

export function reloadWithFlashMessage( messageId: string ) {
	const newUrl = addQueryArgs( window.location.href, { [ FLASH_QUERY_PARAM ]: messageId } );
	window.location.replace( newUrl );
}

/**
 * Shows a snackbar when the `flash` query parameter equals `id`, then removes the parameter.
 * Instances with other ids leave it alone, so several can share a page, and one that stays
 * mounted also catches a flash added by a later redirect.
 */
export default function FlashMessage( { id, message, type = 'success' }: FlashMessageProps ) {
	const { createSuccessNotice, createErrorNotice } = useDispatch( noticesStore );

	useConsumeSearchParams( [ FLASH_QUERY_PARAM ], {
		when: ( params ) => params[ FLASH_QUERY_PARAM ] === id,
		onConsume: () => {
			const createNotice = type === 'error' ? createErrorNotice : createSuccessNotice;
			createNotice( message, { type: 'snackbar' } );
		},
	} );

	return null;
}
