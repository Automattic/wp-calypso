import { useEffect } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { useOdieAssistantContext } from '../context';

export const useUpdateDocumentTitle = () => {
	const { chat } = useOdieAssistantContext();

	useEffect( () => {
		const title = document.title;

		if ( chat.provider === 'zendesk' ) {
			document.title = __( 'Chat with support - WordPress.com' );
		}

		return () => {
			document.title = title;
		};
	}, [ chat.provider ] );
};
