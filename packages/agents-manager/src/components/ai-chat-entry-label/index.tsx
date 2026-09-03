import { __ } from '@wordpress/i18n';
import { useAiChatEntryState } from '../../hooks/use-ai-chat-entry-state';
import '../../styles/ai-chat-label.scss';

/**
 * The "Agent" label a Calypso AI chat entry button shows beside its icon while
 * the chat is hidden. Hidden from assistive tech: the button already carries
 * that name. On wp-admin the label is server-rendered instead (see
 * `useAdminBarIntegration`).
 */
export default function AiChatEntryLabel() {
	const { hasLoaded, isChatVisible } = useAiChatEntryState();

	// Waits for the persisted state so it can't flash beside a chat about to restore open.
	if ( ! hasLoaded || isChatVisible ) {
		return null;
	}

	return (
		<span className="agents-manager-ai-chat-label is-revealed" aria-hidden="true">
			<span>{ __( 'Agent', __i18n_text_domain__ ) }</span>
		</span>
	);
}
