/**
 * Agent Dock Component
 *
 * Manages the floating/docked chat interface, sessions, and conversation history.
 */

import { createOdieBotId, type UseAgentChatConfig } from '@automattic/agenttic-client';
import {
	AgentUI,
	createMessageRenderer,
	type MarkdownComponents,
	type MarkdownExtensions,
	type Suggestion,
} from '@automattic/agenttic-ui';
import { AgentsManagerSelect } from '@automattic/data-stores';
import { useDispatch, useSelect } from '@wordpress/data';
import { useMemo } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { backup, comment, drawerRight, login } from '@wordpress/icons';
import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../../constants';
import useChatLayoutManager from '../../hooks/use-chat-layout-manager';
import { AGENTS_MANAGER_STORE } from '../../stores';
import ChatHeader, { type Options as ChatHeaderOptions } from '../chat-header';
import ConversationHistoryView from '../conversation-history-view';
import Agent from './agent';

interface AgentDockProps {
	/**
	 * Agent configuration for @automattic/agenttic-client
	 */
	agentConfig: UseAgentChatConfig;
	/**
	 * Custom empty view suggestions
	 */
	emptyViewSuggestions?: Suggestion[];
	/**
	 * Custom message renderer components
	 */
	markdownComponents?: MarkdownComponents;
	/**
	 * Custom markdown extensions
	 */
	markdownExtensions?: MarkdownExtensions;
}

export default function AgentDock( {
	agentConfig,
	emptyViewSuggestions = [],
	markdownComponents = {},
	markdownExtensions,
}: AgentDockProps ) {
	const { setIsOpen } = useDispatch( AGENTS_MANAGER_STORE );
	const { isOpen, hasLoaded } = useSelect( ( select ) => {
		const store: AgentsManagerSelect = select( AGENTS_MANAGER_STORE );
		return store.getAgentsManagerState();
	}, [] );
	const navigate = useNavigate();
	const location = useLocation();

	const agentId = agentConfig.agentId;

	const { isDocked, isDesktop, dock, undock, closeSidebar, createChatPortal } =
		useChatLayoutManager();

	const setChatIsOpen = () => {
		setIsOpen( true );
	};

	const setChatIsClosed = () => {
		setIsOpen( false );
	};

	// Custom message renderer that uses our markdown components
	const messageRenderer = useMemo(
		() =>
			createMessageRenderer( {
				components: markdownComponents,
				extensions: markdownExtensions,
			} ),
		[ markdownComponents, markdownExtensions ]
	);

	// Shared menu items creation
	const createMenuItems = () => {
		const isHistoryView = location.pathname === '/history';

		const newChatMenuItem = {
			icon: comment,
			title: __( 'New chat', 'agents-manager' ),
			onClick: () => navigate( '/' ),
		};

		const historyMenuItem = {
			icon: backup,
			title: __( 'View history', 'agents-manager' ),
			isDisabled: isHistoryView,
			onClick: () => navigate( '/history' ),
		};
		const undockMenuItem = {
			icon: login,
			title: __( 'Pop out sidebar', 'agents-manager' ),
			onClick: () => {
				// TODO: Persist the float position...
				try {
					window.localStorage?.setItem( 'agenttic-chat-position', 'right' );
				} catch ( err ) {
					// Ignore errors
				}

				undock();
			},
		};

		const dockMenuItem = {
			icon: drawerRight,
			title: __( 'Move to sidebar', 'agents-manager' ),
			onClick: dock,
		};

		const chatHeaderOptions: ChatHeaderOptions = [ newChatMenuItem, historyMenuItem ];

		if ( isDocked ) {
			chatHeaderOptions.push( undockMenuItem );
		} else if ( isDesktop ) {
			chatHeaderOptions.push( dockMenuItem );
		}

		return chatHeaderOptions;
	};

	// History view component
	const HistoryView = () => {
		const chatHeaderOptions = createMenuItems();

		return (
			<AgentUI.Container
				className="agenttic"
				messages={ [] }
				isProcessing={ false }
				error={ null }
				onSubmit={ () => false }
				variant={ isDocked ? 'embedded' : 'floating' }
				floatingChatState={ isOpen ? 'expanded' : 'collapsed' }
				onClose={ isDocked ? closeSidebar : setChatIsClosed }
				onExpand={ setChatIsOpen }
			>
				<AgentUI.ConversationView>
					<ChatHeader
						isChatDocked={ isDocked }
						onClose={ isDocked ? closeSidebar : setChatIsClosed }
						options={ chatHeaderOptions }
						title={ __( 'Past chats', 'agents-manager' ) }
					/>
					<ConversationHistoryView
						botId={ createOdieBotId( agentId ) }
						apiBaseUrl={ API_BASE_URL }
						authProvider={ agentConfig.authProvider }
						onSelectConversation={ ( newSessionId ) => navigate( `/chat/${ newSessionId }` ) }
						onNewChat={ () => navigate( '/' ) }
					/>
				</AgentUI.ConversationView>
			</AgentUI.Container>
		);
	};

	const OrchestratorAgent = () => {
		return (
			<Agent
				agentConfig={ agentConfig }
				emptyViewSuggestions={ emptyViewSuggestions }
				getChatHeaderOptions={ createMenuItems }
				isDocked={ isDocked }
				messageRenderer={ messageRenderer }
				onClose={ isDocked ? closeSidebar : setChatIsClosed }
			/>
		);
	};

	// Wait user's preferences to be loaded
	if ( ! hasLoaded ) {
		return null;
	}

	return createChatPortal(
		<Routes>
			<Route path="/" element={ <OrchestratorAgent /> } />
			<Route path="/chat/:chatId" element={ <OrchestratorAgent /> } />
			<Route path="/history" element={ <HistoryView /> } />
			<Route path="*" element={ <Navigate to="/" replace /> } />
		</Routes>
	);
}
