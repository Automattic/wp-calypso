import { createOdieBotId, type UseAgentChatConfig } from '@automattic/agenttic-client';
import { AgentUI } from '@automattic/agenttic-ui';
import { __ } from '@wordpress/i18n';
import { useNavigate } from 'react-router-dom';
import { ORCHESTRATOR_AGENT_ID } from '../../constants';
import ChatHeader, { type Options as ChatHeaderOptions } from '../chat-header';
import ConversationHistoryView from '../conversation-history-view';

interface AgentHistoryProps {
	/** Authentication provider for API requests. */
	authProvider: UseAgentChatConfig[ 'authProvider' ];
	/** Chat header menu options. */
	chatHeaderOptions: ChatHeaderOptions;
	/** Indicates if the chat is docked in the sidebar. */
	isDocked: boolean;
	/** Indicates if the chat is expanded (floating mode). */
	isOpen: boolean;
	/** Called when the chat is closed. */
	onClose: () => void;
	/** Called when the chat is expanded (floating mode). */
	onExpand: () => void;
}

export default function AgentHistory( {
	authProvider,
	chatHeaderOptions,
	isDocked,
	isOpen,
	onClose,
	onExpand,
}: AgentHistoryProps ) {
	const navigate = useNavigate();

	return (
		<AgentUI.Container
			className="agenttic"
			messages={ [] }
			isProcessing={ false }
			error={ null }
			onSubmit={ () => null }
			variant={ isDocked ? 'embedded' : 'floating' }
			floatingChatState={ isOpen ? 'expanded' : 'collapsed' }
			onClose={ onClose }
			onExpand={ onExpand }
		>
			<AgentUI.ConversationView>
				<ChatHeader
					isChatDocked={ isDocked }
					onClose={ onClose }
					options={ chatHeaderOptions }
					title={ __( 'Past chats', '__i18n_text_domain__' ) }
				/>
				<ConversationHistoryView
					botId={ createOdieBotId( ORCHESTRATOR_AGENT_ID ) }
					authProvider={ authProvider }
					onSelectConversation={ ( sessionId ) => navigate( `/chat/${ sessionId }` ) }
					onNewChat={ () => navigate( '/' ) }
				/>
			</AgentUI.ConversationView>
		</AgentUI.Container>
	);
}
