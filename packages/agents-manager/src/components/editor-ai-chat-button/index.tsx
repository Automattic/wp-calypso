import { recordTracksEvent } from '@automattic/calypso-analytics';
import { Button, Fill } from '@wordpress/components';
import { useSelect } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
import clsx from 'clsx';
import { useAgentsManagerContext } from '../../contexts';
import { AGENTS_MANAGER_STORE } from '../../stores';
import { isEditorAiEntryEnabled } from '../../utils/editor-entry-points';
import { AI } from '../icons';
import type { AgentsManagerSelect } from '@automattic/data-stores';
import './style.scss';

interface Props {
	/** Closes/hides the chat — owned by `AgentDock`. */
	onClose: () => void;
	/** Opens/un-minimizes the chat — owned by `AgentDock`'s layout manager. */
	onOpenChat: () => void;
}

/**
 * Ask AI button for the block editor header, shown to the right of the Help Center "?" button.
 * The `PinnedItems/core` fill is inert outside the editor.
 */
export default function EditorAiChatButton( { onClose, onOpenChat }: Props ) {
	const { resumeActiveChat, sectionName } = useAgentsManagerContext();
	const { isOpen, isMinimized } = useSelect(
		( select ) => ( select( AGENTS_MANAGER_STORE ) as AgentsManagerSelect ).getAgentsManagerState(),
		[]
	);

	if ( ! isEditorAiEntryEnabled() ) {
		return null;
	}

	const isChatVisible = isOpen && ! isMinimized;

	// Mirrors the admin-bar button: close if showing, else resume the active conversation and open.
	const handleToggle = () => {
		recordTracksEvent( 'calypso_editor_agents_manager_ai_chat_clicked', {
			section: sectionName || 'gutenberg',
			action: isChatVisible ? 'close' : 'open',
		} );

		if ( isChatVisible ) {
			onClose();
			return;
		}

		resumeActiveChat();
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
				label={ __( 'Ask AI', '__i18n_text_domain__' ) }
				aria-pressed={ isChatVisible }
				aria-expanded={ isChatVisible }
				size="compact"
			/>
		</Fill>
	);
}
