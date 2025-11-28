/**
 * Agent Dock Component
 *
 * Manages the floating/docked chat interface, sessions, and conversation history.
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
import ChatMessageSkeleton from '../chat-message-skeleton';
import ConversationHistoryView from '../conversation-history-view';
import { AI } from '../icons';
import type { DockViewState } from './types';

interface AgentDockProps {
	/**
	 * Current session ID
	 */
	sessionId: string;
	/**
	 * Callback to apply a session ID
	 */
	applySessionId: ( sessionId: string ) => void;
	/**
	 * Callback to reset session
	 */
	resetSession: () => void;
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
	sessionId,
	applySessionId,
	resetSession,
	agentConfig,
	emptyViewSuggestions = [],
	markdownComponents = {},
	markdownExtensions = {},
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

	// TODO: We may not need this, will double-check later...
	// Update agent's sessionId when sessionId changes
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
		if ( ! messages.length || ! sessionId ) {
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
						console.warn( '[AgentDock] Attempted to apply empty session ID' );
						return;
					}
					applySessionId( serverSessionId );
				} catch ( error ) {
					// eslint-disable-next-line no-console
					console.error( '[AgentDock] Failed to apply session ID:', error );
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

	const abortCurrentRequest = useCallback( async () => {
		const agentManager = getAgentManager();
		const agentKey = agentId;

		if ( agentManager.hasAgent( agentKey ) ) {
			await agentManager.abortCurrentRequest( agentKey );
		}
	}, [ agentId ] );

	const handleNewChat = useCallback( async () => {
		const agentManager = getAgentManager();
		const agentKey = agentId;

		if ( agentManager.hasAgent( agentKey ) ) {
			// Abort any ongoing requests
			await abortCurrentRequest();
			// Clear chat messages
			await loadMessages( [] );

			// Remove and recreate the agent to ensure all internal state is reset
			agentManager.removeAgent( agentKey );
			await agentManager.createAgent( agentKey, { ...agentConfig } );
		}

		// Clear cached messages to prevent old messages from being reloaded
		lastConversationCache.clear();

		// Reset session to empty (new chat) - this generates a new session ID
		resetSession();

		// Switch back to chat view
		if ( viewState === 'history' ) {
			setViewState( 'chat' );
		}
	}, [ abortCurrentRequest, agentConfig, agentId, loadMessages, resetSession, viewState ] );

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

	const renderAgentUI = () => {
		const newChatMenuItem = {
			icon: comment,
			title: __( 'New chat', 'agents-manager' ),
			isDisabled: viewState === 'chat' && ! messages.length,
			onClick: handleNewChat,
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
					onStop={ abortCurrentRequest }
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
				onStop={ abortCurrentRequest }
				messageRenderer={ messageRenderer }
				emptyView={
					isLoadingRef.current ||
					isLoadingConversation ||
					( sessionId && loadedSessionIdRef.current !== sessionId ) ? (
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
