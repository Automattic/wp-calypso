import { getAgentManager } from '@automattic/agenttic-client';
import { useState } from '@wordpress/element';
import { useNavigate } from 'react-router-dom';
import { useAgentsManagerContext } from '../contexts';
import { saveSessionId } from '../utils/agent-session';
import { recordAgentsManagerTracksEvent } from '../utils/tracks';
import { useSetupCustomActions } from './custom-actions';
import type { LocalConversationListItem } from '../types';

const noop = () => {};

/** Keeps chat navigation and provider actions available without mounting the dock layout manager. */
export function useFullscreenNavigation() {
	const { agentConfig, siteKey, currentUser } = useAgentsManagerContext();
	const navigate = useNavigate();
	const [ isChatEnabled, setIsChatEnabled ] = useState(
		window.__agentsManagerActions?.isChatEnabled ?? true
	);

	useSetupCustomActions( {
		canDock: false,
		dock: noop,
		undock: noop,
		openSidebar: noop,
		closeSidebar: noop,
		setIsCompactMode: noop,
		setDesktopMediaQuery: noop,
		setIsChatEnabled,
	} );

	const abort = () => {
		const manager = getAgentManager();
		if ( agentConfig && manager.hasAgent( agentConfig.agentId ) ) {
			manager.abortCurrentRequest( agentConfig.agentId );
		}
	};

	const startNewChat = () => {
		abort();
		navigate( '/chat', { state: { isNewChat: true } } );
	};

	const selectConversation = ( conversation: LocalConversationListItem ) => {
		if ( conversation.is_zendesk ) {
			navigate( '/zendesk', { state: { conversationId: conversation.conversation_id } } );
			return;
		}

		if ( conversation.session_id ) {
			saveSessionId( conversation.session_id, agentConfig?.agentId, siteKey, currentUser?.ID );
		}
		recordAgentsManagerTracksEvent( 'calypso_agents_manager_history_conversation_selected', {
			is_zendesk: false,
		} );
		abort();
		navigate( '/chat', { state: { switchSession: true } } );
	};

	const exitFullscreen = () => {
		const url = new URL( window.location.href );
		url.searchParams.delete( 'am-fullscreen' );
		window.location.assign( url.toString() );
	};

	return {
		abort,
		exitFullscreen,
		startNewChat,
		selectConversation,
		isChatInputDisabled: ! isChatEnabled,
		onClose: noop,
		onExpand: noop,
		onHasMessagesChange: noop,
		chatHeaderOptions: [],
	};
}
