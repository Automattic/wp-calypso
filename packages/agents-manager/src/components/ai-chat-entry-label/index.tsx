import { __ } from '@wordpress/i18n';
import { useAiChatEntryState } from '../../hooks/use-ai-chat-entry-state';
import './style.scss';

/**
 * The "Agent" label an AI chat entry button shows beside its icon while the chat
 * is hidden. Visual only: the buttons keep "Ask AI" as their accessible name.
 */
export default function AiChatEntryLabel() {
	const { isLabelVisible } = useAiChatEntryState();

	if ( ! isLabelVisible ) {
		return null;
	}

	return (
		<span className="agents-manager-ai-chat-label" aria-hidden="true">
			<span>{ __( 'Agent', __i18n_text_domain__ ) }</span>
		</span>
	);
}
