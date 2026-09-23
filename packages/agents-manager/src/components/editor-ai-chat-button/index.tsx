import { Button, Fill } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import clsx from 'clsx';
import { useAgentsManagerContext } from '../../contexts';
import { useAiChatEntryState } from '../../hooks/use-ai-chat-entry-state';
import { isEditorAiEntryEnabled } from '../../utils/editor-entry-points';
import { recordAgentsManagerTracksEvent } from '../../utils/tracks';
import { AI } from '../icons';
import './style.scss';

interface Props {
	/** Closes/hides the chat — owned by `AgentDock`. */
	onClose: () => void;
	/** Opens/un-minimizes the chat — owned by `AgentDock`'s layout manager. */
	onOpenChat: () => void;
}

/**
 * AI chat button for the block editor header, shown to the right of the Help Center "?" button.
 * The `PinnedItems/core` fill is inert outside the editor.
 */
export default function EditorAiChatButton( { onClose, onOpenChat }: Props ) {
	const { resumeChat, sectionName } = useAgentsManagerContext();
	const { isChatVisible } = useAiChatEntryState();

	if ( ! isEditorAiEntryEnabled() ) {
		return null;
	}

	// Mirrors the admin-bar button: close if showing, else resume the tab's conversation and open.
	const handleToggle = () => {
		recordAgentsManagerTracksEvent( 'calypso_agents_manager_ai_chat_clicked', {
			surface: 'editor_toolbar',
			section: sectionName || 'gutenberg',
			action: isChatVisible ? 'close' : 'open',
		} );

		if ( isChatVisible ) {
			onClose();
			return;
		}

		resumeChat();
		onOpenChat();
	};

	return (
		<Fill name="PinnedItems/core">
			<Button
				className={ clsx( 'entry-point-button', 'agents-manager-ai-chat', {
					'is-active': isChatVisible,
				} ) }
				onClick={ handleToggle }
				icon={ <AI /> }
				label={ __( 'Agent', __i18n_text_domain__ ) }
				aria-pressed={ isChatVisible }
				aria-expanded={ isChatVisible }
				size="compact"
			/>
		</Fill>
	);
}
