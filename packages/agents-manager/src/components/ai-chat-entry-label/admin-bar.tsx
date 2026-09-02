import { createPortal, useMemo } from '@wordpress/element';
import useHasAiChatEntryButton, {
	ADMIN_BAR_AI_CHAT_BUTTON_ID,
} from '../../hooks/use-has-ai-chat-entry-button';
import AiChatEntryLabel from '.';

/**
 * Portals the "Agent" label into the wp-admin bar's Ask AI button, which PHP
 * renders outside the React root. Renders nothing where that button is absent.
 */
export default function AdminBarAiChatEntryLabel() {
	const hasAiChatEntry = useHasAiChatEntryButton();
	const target = useMemo(
		() =>
			hasAiChatEntry
				? document.querySelector( `#${ ADMIN_BAR_AI_CHAT_BUTTON_ID } > .ab-item` )
				: null,
		[ hasAiChatEntry ]
	);

	return target ? createPortal( <AiChatEntryLabel />, target ) : null;
}
