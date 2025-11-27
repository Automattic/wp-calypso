/**
 * Agent Dock Component
 * Provides floating and docked AI chat, managing sessions and history.
 */

import {
	createOdieBotId,
	getAgentManager,
	useAgentChat,
	type Message,
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
import { useCallback, useEffect, useMemo, useState, useRef } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { comment, drawerRight, login } from '@wordpress/icons';
import { API_BASE_URL } from '../../constants';
import useChatLayoutManager from '../../hooks/use-chat-layout-manager';
import useLoadConversation from '../../hooks/use-load-conversation';
import { AGENTS_MANAGER_STORE } from '../../stores';
import { lastConversationCache } from '../../utils/conversation-cache';
import BigSkyIcon from '../big-sky-icon';
import ChatHeader, { type Options as ChatHeaderOptions } from '../chat-header';
import { ChatMessageSkeleton } from '../chat-message-skeleton';
import ConversationHistoryView from '../conversation-history-view';
import { AI } from '../icons';
import type { DockViewState } from './types';

export interface AgentDockProps {
	/**
	 * Agent configuration for @automattic/agenttic-client
	 */
	agentConfig: UseAgentChatConfig;
	/**
	 * Current session ID
	 */
	sessionId: string;
	/**
	 * Callback to reset the current session
	 */
	resetSession: () => string;
	/**
	 * Callback to apply a new session ID
	 */
	applySessionId: ( sessionId: string ) => void;
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
	sessionId,
	resetSession,
	applySessionId,
	emptyViewSuggestions = [],
	markdownComponents = {},
	markdownExtensions,
}: AgentDockProps ) {
	const { setIsOpen } = useDispatch( AGENTS_MANAGER_STORE );
	const persistedState = useSelect( ( select ) => {
		const store: AgentsManagerSelect = select( AGENTS_MANAGER_STORE );
		return store.getAgentsManagerState();
	}, [] );
	const [ viewState, setViewState ] = useState< DockViewState >( 'chat' );
	const isLoadingRef = useRef( false );
	const loadedSessionIdRef = useRef< string | null >( null );

	const agentId = agentConfig.agentId;
	const chatState = persistedState.isOpen ? 'expanded' : 'collapsed';

	const { isDocked, isDesktop, dock, undock, closeSidebar, createChatPortal } =
		useChatLayoutManager();

	const { messages, suggestions, isProcessing, error, loadMessages, onSubmit } =
		useAgentChat( agentConfig );

	// TODO: Migrate to the routing solution...
	// Update agent's sessionId when sessionId prop changes
	useEffect( () => {
		if ( ! sessionId ) {
			return;
		}

		const agentManager = getAgentManager();
		const agentKey = agentId;

		if ( agentManager.hasAgent( agentKey ) ) {
			agentManager.updateSessionId( agentKey, sessionId );
		}
	}, [ agentId, sessionId ] );

	// Update cache whenever messages change
	useEffect( () => {
		if ( messages.length === 0 || ! sessionId ) {
			return;
		}

		const agentManager = getAgentManager();
		const agentKey = agentId;

		if ( ! agentManager.hasAgent( agentKey ) ) {
			return;
		}

		// Get Message[] from agentManager and cache it
		const clientMessages = agentManager.getConversationHistory( agentKey );
		if ( clientMessages.length > 0 ) {
			const botId = createOdieBotId( agentId );
			lastConversationCache.set( botId, sessionId, clientMessages );
		}
	}, [ agentId, messages.length, sessionId ] );

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
			if ( sessionId !== serverSessionId ) {
				try {
					if ( ! serverSessionId ) {
						// eslint-disable-next-line no-console
						console.warn( 'Attempted to apply empty session ID' );
						return;
					}
					applySessionId( serverSessionId );
				} catch ( error ) {
					// eslint-disable-next-line no-console
					console.error( 'Failed to apply session ID:', error );
					return;
				}
			}

			// Track that we've loaded this session (after successful validation)
			loadedSessionIdRef.current = serverSessionId;
		},
		[ agentConfig, agentId, applySessionId, loadMessages, sessionId ]
	);

	// Conversation loading hook
	const { loadConversation, isLoading: isLoadingConversation } = useLoadConversation( {
		apiBaseUrl: API_BASE_URL,
		authProvider: agentConfig.authProvider,
		onLoaded,
	} );

	// Load conversation when switching to a session
	// This handles clicking a conversation from the history list
	useEffect( () => {
		if ( ! sessionId || isLoadingRef.current ) {
			return;
		}

		const agentManager = getAgentManager();
		const agentKey = agentId;

		// Agent is created by useAgentChat, but might not have messages loaded yet
		// Check if we need to load messages from server
		if ( agentManager.hasAgent( agentKey ) ) {
			// Load if this is a different session than what's currently loaded
			if ( loadedSessionIdRef.current !== sessionId ) {
				isLoadingRef.current = true;
				const botId = createOdieBotId( agentId );
				loadConversation( sessionId, botId ).finally( () => {
					isLoadingRef.current = false;
				} );
			}
		}
	}, [ agentId, loadConversation, sessionId ] );

	const setChatIsOpen = () => {
		setIsOpen( true );
	};

	const setChatIsClosed = () => {
		setIsOpen( false );
	};

	const handleNewChat = useCallback( () => {
		const agentManager = getAgentManager();
		const agentKey = agentId;

		// Remove the agent entirely so it gets recreated fresh
		if ( agentManager.hasAgent( agentKey ) ) {
			agentManager.removeAgent( agentKey );
		}

		// Clear cached messages to prevent old messages from being reloaded
		lastConversationCache.clear();

		// Reset session to empty (new chat) - this triggers config re-creation
		resetSession();

		// Switch back to chat view
		setViewState( 'chat' );
	}, [ agentId, resetSession ] );

	const handleToggleHistory = () => {
		setViewState( ( prev ) => ( prev === 'chat' ? 'history' : 'chat' ) );
	};

	const handleSelectConversation = useCallback(
		( newSessionId: string ) => {
			// Switch to chat view immediately
			setViewState( 'chat' );

			// Update session with the UUID session_id
			applySessionId( newSessionId );
		},
		[ applySessionId ]
	);

	// Custom message renderer that uses our markdown components
	const messageRenderer = useMemo(
		() =>
			createMessageRenderer( {
				components: markdownComponents,
				extensions: markdownExtensions,
			} ),
		[ markdownComponents, markdownExtensions ]
	);

	// TODO: Check app crash during chatting...
	const renderAgentUI = () => {
		// TODO: This not work...
		const newChatMenuItem = {
			icon: comment,
			title: __( 'New chat', 'agents-manager' ),
			isDisabled: ! messages.length,
			onClick: handleNewChat,
		};
		const undockMenuItem = {
			icon: login,
			title: __( 'Pop out sidebar', 'agents-manager' ),
			onClick: () => {
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

		const chatHeaderOptions: ChatHeaderOptions = [ newChatMenuItem ];

		if ( isDocked ) {
			chatHeaderOptions.push( undockMenuItem );
		} else if ( isDesktop ) {
			chatHeaderOptions.push( dockMenuItem );
		}

		// Show conversation history view
		if ( viewState === 'history' ) {
			return (
				<AgentUI.Container
					className="agenttic"
					messages={ messages }
					isProcessing={ false }
					error={ null }
					onSubmit={ onSubmit }
					variant={ isDocked ? 'embedded' : 'floating' }
					floatingChatState={ chatState }
					onClose={ isDocked ? closeSidebar : setChatIsClosed }
					onExpand={ setChatIsOpen }
				>
					<AgentUI.ConversationView>
						<ChatHeader
							isChatDocked={ isDocked }
							onClose={ isDocked ? closeSidebar : setChatIsClosed }
							options={ chatHeaderOptions }
							onHistoryToggle={ handleToggleHistory }
							viewState={ viewState }
							title={ __( 'Past chats', 'agents-manager' ) }
						/>
						<ConversationHistoryView
							botId={ createOdieBotId( agentId ) }
							apiBaseUrl={ API_BASE_URL }
							authProvider={ agentConfig.authProvider }
							onSelectConversation={ handleSelectConversation }
							onNewChat={ handleNewChat }
						/>
					</AgentUI.ConversationView>
				</AgentUI.Container>
			);
		}

		return (
			<AgentUI.Container
				className="agenttic"
				messages={ messages }
				isProcessing={ isProcessing }
				error={ error }
				onSubmit={ onSubmit }
				variant={ isDocked ? 'embedded' : 'floating' }
				suggestions={ suggestions }
				floatingChatState={ chatState }
				onClose={ isDocked ? closeSidebar : setChatIsClosed }
				onExpand={ setChatIsOpen }
				messageRenderer={ messageRenderer }
				emptyView={
					isLoadingRef.current ||
					isLoadingConversation ||
					( sessionId && loadedSessionIdRef.current !== sessionId && messages.length === 0 ) ? (
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
						onClose={ isDocked ? closeSidebar : setChatIsClosed }
						options={ chatHeaderOptions }
						onHistoryToggle={ handleToggleHistory }
						viewState={ viewState }
						supportsHistory
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

	// Wait user's preferences to be loaded
	if ( ! persistedState.hasLoaded ) {
		return null;
	}

	return createChatPortal( renderAgentUI() );
}
