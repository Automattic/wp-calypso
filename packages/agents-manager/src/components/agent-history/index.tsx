import { AgentUI } from '@automattic/agenttic-ui';
import { AgentsManagerSelect } from '@automattic/data-stores';
import { useDispatch, useSelect } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
import clsx from 'clsx';
import { useAgentsManagerContext } from '../../contexts';
import useHasAiChatEntryButton from '../../hooks/use-has-ai-chat-entry-button';
import { AGENTS_MANAGER_STORE } from '../../stores';
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

	const { setFloatingPosition, setFreeDragPosition, setFloatingSize } =
		useDispatch( AGENTS_MANAGER_STORE );
	const { floatingPosition, freeDragPosition, floatingSize } = useSelect( ( select ) => {
		const store: AgentsManagerSelect = select( AGENTS_MANAGER_STORE );
		return store.getAgentsManagerState();
	}, [] );

	// Without the AI chat entry button, use `collapsed` (a FAB) instead of `minimized`.
	const closedChatState = useHasAiChatEntryButton() ? 'minimized' : 'collapsed';
	const title = __( 'Past chats', __i18n_text_domain__ );

	const handleBack = () => resumeActiveChat();

	return (
		<AgentUI.Container
			initialChatPosition={ floatingPosition }
			onChatPositionChange={ ( position ) => setFloatingPosition( position ) }
			initialFreeDragPosition={ freeDragPosition ?? undefined }
			onFreeDragEnd={ setFreeDragPosition }
			defaultSize={ floatingSize ?? undefined }
			onResizeEnd={ setFloatingSize }
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
