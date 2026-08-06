import { AgentUI } from '@automattic/agenttic-ui';
import { __ } from '@wordpress/i18n';
import clsx from 'clsx';
import { useAgentsManagerContext } from '../../contexts';
import useFloatingPanelProps from '../../hooks/use-floating-panel-props';
import useHasAiChatEntryButton from '../../hooks/use-has-ai-chat-entry-button';
import { LocalConversationListItem } from '../../types';
import ChatHeader, { type Options as ChatHeaderOptions } from '../chat-header';
import ConversationHistoryView from '../conversation-history-view';

interface Props {
	/** Chat header menu options. */
	chatHeaderOptions: ChatHeaderOptions;
	/** Indicates if the chat is docked in the sidebar. */
	isDocked: boolean;
	/** Indicates if the chat is expanded (floating mode). */
	isOpen: boolean;
	/** Called when the user aborts the current request. */
	onAbort: () => void;
	/** Called when the chat is closed. */
	onClose: () => void;
	/** Called when the chat is expanded (floating mode). */
	onExpand: () => void;
	/** Called when a conversation is selected. */
	onSelectConversation: ( conversation: LocalConversationListItem ) => void;
}

export default function AgentHistory( {
	chatHeaderOptions,
	isDocked,
	isOpen,
	onAbort,
	onClose,
	onExpand,
	onSelectConversation,
}: Props ) {
	const { resumeActiveChat } = useAgentsManagerContext();
	const floatingPanelProps = useFloatingPanelProps();

	// Without the AI chat entry button, use `collapsed` (a FAB) instead of `minimized`.
	const closedChatState = useHasAiChatEntryButton() ? 'minimized' : 'collapsed';
	const title = __( 'Past chats', __i18n_text_domain__ );

	const handleBack = () => resumeActiveChat();

	return (
		<AgentUI.Container
			// Remount on dock/undock so the floating panel re-seeds — the seed
			// props are read at mount only.
			key={ isDocked ? 'embedded' : 'floating' }
			{ ...floatingPanelProps }
			className={ clsx( 'agenttic', { dark: isDocked } ) }
			messages={ [] }
			isProcessing={ false }
			error={ null }
			onSubmit={ () => {} }
			variant={ isDocked ? 'embedded' : 'floating' }
			freeDrag={ ! isDocked }
			resizable={ ! isDocked }
			floatingChatState={ isOpen ? 'expanded' : closedChatState }
			triggerTitle={ title }
			onClose={ onClose }
			onExpand={ onExpand }
			onStop={ onAbort }
			expandOnHover={ false }
		>
			<AgentUI.ConversationView>
				<ChatHeader
					onClose={ onClose }
					onBack={ handleBack }
					options={ chatHeaderOptions }
					title={ title }
					isDocked={ isDocked }
				/>
				<ConversationHistoryView onSelectConversation={ onSelectConversation } />
			</AgentUI.ConversationView>
		</AgentUI.Container>
	);
}
