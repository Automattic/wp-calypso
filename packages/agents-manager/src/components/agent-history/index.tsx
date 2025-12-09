import { createOdieBotId, type UseAgentChatConfig } from '@automattic/agenttic-client';
import { AgentUI } from '@automattic/agenttic-ui';
import { __ } from '@wordpress/i18n';
import ChatHeader, { type Options as ChatHeaderOptions } from '../chat-header';
import ConversationHistoryView from '../conversation-history-view';

interface AgentHistoryProps {
	/** Agent ID for fetching conversation history. */
	agentId: string;
	/** Authentication provider for API requests. */
	authProvider: UseAgentChatConfig[ 'authProvider' ];
	/** Chat header menu options. */
	chatHeaderOptions: ChatHeaderOptions;
	/** Indicates if the chat is docked in the sidebar. */
	isDocked: boolean;
	/** Indicates if the chat is expanded (floating mode). */
	isOpen: boolean;
	/** Called when the user submits a message. */
	onSubmit: ( message: string ) => void;
	/** Called when the user aborts the current request. */
	onAbort: () => void;
	/** Called when the chat is closed. */
	onClose: () => void;
	/** Called when the chat is expanded (floating mode). */
	onExpand: () => void;
	/** Called when a conversation is selected. */
	onSelectConversation: ( sessionId: string ) => void;
	/** Called when the user starts a new chat. */
	onNewChat: () => void;
}

export default function AgentHistory( {
	agentId,
	authProvider,
	chatHeaderOptions,
	isDocked,
	isOpen,
	onSubmit,
	onAbort,
	onClose,
	onExpand,
	onSelectConversation,
	onNewChat,
}: AgentHistoryProps ) {
	return (
		<AgentUI.Container
			className="agenttic"
			messages={ [] }
			isProcessing={ false }
			error={ null }
			onSubmit={ onSubmit }
			variant={ isDocked ? 'embedded' : 'floating' }
			floatingChatState={ isOpen ? 'expanded' : 'collapsed' }
			onClose={ onClose }
			onExpand={ onExpand }
			onStop={ onAbort }
		>
			<AgentUI.ConversationView>
				<ChatHeader
					isChatDocked={ isDocked }
					onClose={ onClose }
					options={ chatHeaderOptions }
					title={ __( 'Past chats', '__i18n_text_domain__' ) }
				/>
				<ConversationHistoryView
					botId={ createOdieBotId( agentId ) }
					authProvider={ authProvider }
					onSelectConversation={ onSelectConversation }
					onNewChat={ onNewChat }
				/>
			</AgentUI.ConversationView>
		</AgentUI.Container>
	);
}
