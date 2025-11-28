/**
 * Agent Dock Component
 *
 * Manages the floating/docked chat interface, sessions, and conversation history.
 */

import {
	createOdieBotId,
	getAgentManager,
	type Message,
	useAgentChat,
	type UseAgentChatConfig,
} from '@automattic/agenttic-client';
import {
	AgentUI,
	createMessageRenderer,
	EmptyView,
	type MarkdownComponents,
	type MarkdownExtensions,
	type Suggestion,
} from '@automattic/agenttic-ui';
import { AgentsManagerSelect } from '@automattic/data-stores';
import { useDispatch, useSelect } from '@wordpress/data';
import { useCallback, useEffect, useMemo, useRef } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { backup, comment, drawerRight, login } from '@wordpress/icons';
import { Navigate, Route, Routes, useLocation, useNavigate, useParams } from 'react-router-dom';
import { API_BASE_URL } from '../../constants';
import useChatLayoutManager from '../../hooks/use-chat-layout-manager';
import useLoadConversation from '../../hooks/use-load-conversation';
import { AGENTS_MANAGER_STORE } from '../../stores';
import { lastConversationCache } from '../../utils/conversation-cache';
import BigSkyIcon from '../big-sky-icon';
import ChatHeader, { type Options as ChatHeaderOptions } from '../chat-header';
import ChatMessageSkeleton from '../chat-message-skeleton';
import ConversationHistoryView from '../conversation-history-view';
import { AI } from '../icons';
import type { ComponentType } from 'react';

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

const Agent = ( {
	agentConfig,
	emptyViewSuggestions,
	getChatHeaderOptions,
	isDocked,
	messageRenderer,
	onClose,
}: {
	agentConfig: UseAgentChatConfig;
	emptyViewSuggestions: Suggestion[];
	getChatHeaderOptions: () => ChatHeaderOptions;
	isDocked: boolean;
	messageRenderer: ComponentType< { children: string } >;
	onClose: () => void;
} ) => {
	const { chatId = '' } = useParams< { chatId?: string } >();
	const { setIsOpen, setSessionId } = useDispatch( AGENTS_MANAGER_STORE );
	const { isOpen } = useSelect( ( select ) => {
		const store: AgentsManagerSelect = select( AGENTS_MANAGER_STORE );
		return store.getAgentsManagerState();
	}, [] );
	const navigate = useNavigate();

	const isLoadingRef = useRef( false );
	const loadedSessionIdRef = useRef< string | null >( null );

	const agentId = agentConfig.agentId;

	const { messages, suggestions, isProcessing, error, loadMessages, onSubmit } =
		useAgentChat( agentConfig );

	// Memoized callback for when conversation loads from server
	const onLoaded = useCallback(
		async ( loadedMessages: Message[], serverSessionId: string ) => {
			const agentManager = getAgentManager();
			const agentKey = agentId;

			// Agent should already be created by useAgentChat, but check just in case
			if ( ! agentManager.hasAgent( agentKey ) ) {
				await agentManager.createAgent( agentKey, {
					...agentConfig,
					sessionId: serverSessionId,
				} );
			}

			// Use loadMessages instead of direct replaceMessages to ensure React state updates
			await loadMessages( loadedMessages );

			// Update the agent's sessionId so future messages use the correct session
			agentManager.updateSessionId( agentKey, serverSessionId );

			// Only update session if it changed (prevents unnecessary re-renders)
			if ( chatId !== serverSessionId ) {
				try {
					if ( ! serverSessionId ) {
						// eslint-disable-next-line no-console
						console.warn( '[AgentDock] Attempted to apply empty session ID' );
						return;
					}

					navigate( `/chat/${ serverSessionId }`, { replace: true } );
				} catch ( error ) {
					// eslint-disable-next-line no-console
					console.error( '[AgentDock] Failed to apply session ID:', error );
					return;
				}
			}

			// Track that we've loaded this session (after successful validation)
			loadedSessionIdRef.current = serverSessionId;
		},
		[ agentId, loadMessages, chatId, agentConfig, navigate ]
	);

	// Conversation loading hook
	const { loadConversation, isLoading: isLoadingConversation } = useLoadConversation( {
		apiBaseUrl: API_BASE_URL,
		authProvider: agentConfig.authProvider,
		onLoaded,
	} );

	const abortCurrentRequest = useCallback( async () => {
		const agentManager = getAgentManager();
		const agentKey = agentId;

		if ( agentManager.hasAgent( agentKey ) ) {
			await agentManager.abortCurrentRequest( agentKey );
		}
	}, [ agentId ] );

	useEffect( () => {
		// Navigated to a new chat - reset session
		if ( ! chatId ) {
			abortCurrentRequest();
			lastConversationCache.clear();
		}

		//Sync store session id
		setSessionId( chatId );
	}, [ abortCurrentRequest, chatId, setSessionId ] );

	// Update cache whenever messages change
	useEffect( () => {
		if ( ! messages.length || ! chatId ) {
			return;
		}

		const agentManager = getAgentManager();
		const agentKey = agentId;

		if ( ! agentManager.hasAgent( agentKey ) ) {
			return;
		}

		// Get Message[] from agentManager and cache it
		const clientMessages = agentManager.getConversationHistory( agentKey );
		if ( clientMessages.length ) {
			const botId = createOdieBotId( agentId );
			lastConversationCache.set( botId, chatId, clientMessages );
		}
	}, [ agentId, messages.length, chatId ] );

	// Load conversation when switching to a session
	// This handles clicking a conversation from the history list
	useEffect( () => {
		if ( ! chatId || isLoadingRef.current ) {
			return;
		}

		const agentManager = getAgentManager();
		// Agent is created by useAgentChat, but might not have messages loaded yet
		// Check if we need to load messages from server
		if ( agentManager.hasAgent( agentId ) ) {
			// Load if this is a different session than what's currently loaded
			if ( loadedSessionIdRef.current !== chatId ) {
				isLoadingRef.current = true;
				const botId = createOdieBotId( agentId );
				loadConversation( chatId, botId ).finally( () => {
					isLoadingRef.current = false;
				} );
			}
		}
	}, [ agentId, loadConversation, chatId ] );

	return (
		<AgentUI.Container
			className="agenttic"
			messages={ messages }
			isProcessing={ isProcessing }
			error={ error }
			onSubmit={ onSubmit }
			variant={ isDocked ? 'embedded' : 'floating' }
			suggestions={ suggestions }
			floatingChatState={ isOpen ? 'expanded' : 'collapsed' }
			onClose={ onClose }
			onExpand={ () => setIsOpen( true ) }
			onStop={ abortCurrentRequest }
			messageRenderer={ messageRenderer }
			emptyView={
				isLoadingRef.current ||
				isLoadingConversation ||
				( chatId && loadedSessionIdRef.current !== chatId && messages.length === 0 ) ? (
					<ChatMessageSkeleton count={ 3 } />
				) : (
					<EmptyView
						heading={ __( 'Howdy! How can I help you today?', 'agents-manager' ) }
						help={ __( 'Got a different request? Ask away.', 'agents-manager' ) }
						suggestions={ emptyViewSuggestions }
						icon={ isDocked ? <AI /> : <BigSkyIcon width={ 64 } height={ 64 } /> }
					/>
				)
			}
		>
			<AgentUI.ConversationView>
				<ChatHeader
					isChatDocked={ isDocked }
					onClose={ onClose }
					options={ getChatHeaderOptions() }
				/>
				{ isLoadingConversation ? <ChatMessageSkeleton count={ 3 } /> : <AgentUI.Messages /> }
				<AgentUI.Footer>
					<AgentUI.Suggestions />
					<AgentUI.Notice />
					<AgentUI.Input />
				</AgentUI.Footer>
			</AgentUI.ConversationView>
		</AgentUI.Container>
	);
};

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
