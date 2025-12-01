/**
 * Agent Dock Component
 *
 * Renders a chat interface (floating or docked) with session and history management.
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
import { getSessionId, setSessionId, clearSessionId } from '../../utils/agent-session';
import { lastConversationCache } from '../../utils/conversation-cache';
import BigSkyIcon from '../big-sky-icon';
import ChatHeader, { type Options as ChatHeaderOptions } from '../chat-header';
import ChatMessageSkeleton from '../chat-message-skeleton';
import ConversationHistoryView from '../conversation-history-view';
import { AI } from '../icons';
import type { DockViewState } from './types';

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
	markdownExtensions = {},
}: AgentDockProps ) {
	const { setIsOpen } = useDispatch( AGENTS_MANAGER_STORE );
	// Get saved preferences like whether the chat was open/closed
	const persistedState = useSelect( ( select ) => {
		const store: AgentsManagerSelect = select( AGENTS_MANAGER_STORE );
		return store.getAgentsManagerState();
	}, [] );
	// 'chat' shows the conversation, 'history' shows past conversations
	const [ viewState, setViewState ] = useState< DockViewState >( 'chat' );
	// Tracks which session we've already loaded to avoid redundant fetches
	const loadedSessionIdRef = useRef< string | null >( null );

	// Note: Ideally `sessionId` should be managed via React State to ensure reactivity.
	// However, reading directly from storage works sufficiently for the current use case.
	const sessionId = getSessionId();
	const agentId = agentConfig.agentId;
	const chatState = persistedState.isOpen ? 'expanded' : 'collapsed';

	// Manage how the chat is displayed: floating window or docked in sidebar
	const { isDocked, isDesktop, dock, undock, closeSidebar, createChatPortal } =
		useChatLayoutManager();

	// Main chat hook: handles messages, sending, and AI processing state
	const {
		messages,
		suggestions,
		isProcessing,
		error,
		loadMessages,
		onSubmit,
		abortCurrentRequest,
	} = useAgentChat( agentConfig );

	// Keep the local cache up to date so we can quickly restore the chat later
	useEffect( () => {
		if ( ! messages.length || ! sessionId ) {
			return;
		}

		const agentManager = getAgentManager();
		const agentKey = agentId;

		if ( ! agentManager.hasAgent( agentKey ) ) {
			return;
		}

		const clientMessages = agentManager.getConversationHistory( agentKey );
		if ( clientMessages.length ) {
			const botId = createOdieBotId( agentId );
			lastConversationCache.set( botId, sessionId, clientMessages );
		}
	}, [ agentId, messages.length, sessionId ] );

	// Called after we fetch the conversation from the server
	const onLoaded = useCallback(
		async ( loadedMessages: Message[], serverSessionId: string ) => {
			// Update the UI with the loaded messages
			await loadMessages( loadedMessages );

			// Make sure future messages go to the right session
			getAgentManager().updateSessionId( agentId, serverSessionId );

			// Persist to localStorage only if we got a valid new session ID
			if ( serverSessionId && sessionId !== serverSessionId ) {
				setSessionId( serverSessionId );
			}

			// Remember that we loaded this session so we don't load it again
			loadedSessionIdRef.current = serverSessionId;
		},
		[ agentId, loadMessages, sessionId ]
	);

	// Hook that handles fetching conversation history from the server
	const { loadConversation, isLoading: isLoadingConversation } = useLoadConversation( {
		apiBaseUrl: API_BASE_URL,
		authProvider: agentConfig.authProvider,
		onLoaded,
	} );

	// Fetch the conversation from the server (skips if already loaded)
	const maybeLoadConversation = useCallback(
		( sessionId: string ) => {
			if ( loadedSessionIdRef.current === sessionId ) {
				return;
			}

			const agentManager = getAgentManager();
			const agentKey = agentId;

			if ( ! agentManager.hasAgent( agentKey ) ) {
				// eslint-disable-next-line no-console
				console.warn( '[AgentDock] Agent not found, skipping conversation load' );
				return;
			}

			const botId = createOdieBotId( agentId );
			loadConversation( sessionId, botId );
		},
		[ agentId, loadConversation ]
	);

	// When the component loads, restore the previous chat if there was one
	useEffect(
		() => {
			if ( sessionId ) {
				maybeLoadConversation( sessionId );
			}
		},
		// eslint-disable-next-line react-hooks/exhaustive-deps -- Only run on mount
		[]
	);

	// Handlers for opening/closing the floating chat
	const setChatIsOpen = () => {
		setIsOpen( true );
	};

	const setChatIsClosed = () => {
		setIsOpen( false );
	};

	// Start a brand new chat, wiping out everything from the current one
	const handleNewChat = useCallback( async () => {
		const agentManager = getAgentManager();
		const agentKey = agentId;

		if ( agentManager.hasAgent( agentKey ) ) {
			abortCurrentRequest();
			await loadMessages( [] );

			// Start fresh: remove the old agent and create a new one without a session.
			// The server will give us a new session ID once the user sends a message.
			agentManager.removeAgent( agentKey );
			await agentManager.createAgent( agentKey, { ...agentConfig, sessionId: '' } );
		}

		// Wipe all saved data
		lastConversationCache.clear();
		clearSessionId();
		loadedSessionIdRef.current = null;

		// Go back to the chat view if we were looking at history
		if ( viewState === 'history' ) {
			setViewState( 'chat' );
		}
	}, [ abortCurrentRequest, agentConfig, agentId, loadMessages, viewState ] );

	// User picked a past conversation from history, so load it up
	const handleSelectConversation = useCallback(
		( newSessionId: string ) => {
			setViewState( 'chat' );

			const agentManager = getAgentManager();
			const agentKey = agentId;

			if ( agentManager.hasAgent( agentKey ) ) {
				abortCurrentRequest();
				agentManager.updateSessionId( agentKey, newSessionId );
				maybeLoadConversation( newSessionId );
			}
		},
		[ abortCurrentRequest, agentId, maybeLoadConversation ]
	);

	// Toggle between chat view and conversation history view
	const handleToggleHistory = () => {
		setViewState( ( prev ) => ( prev === 'chat' ? 'history' : 'chat' ) );
	};

	// Set up how messages get rendered (with any custom markdown handling)
	const messageRenderer = useMemo(
		() =>
			createMessageRenderer( {
				components: markdownComponents,
				extensions: markdownExtensions,
			} ),
		[ markdownComponents, markdownExtensions ]
	);

	// Build the chat UI based on current view state (chat or history)
	const renderAgentUI = () => {
		// Menu items for the chat header dropdown
		const newChatMenuItem = {
			icon: comment,
			title: __( 'New chat', '__i18n_text_domain__' ),
			isDisabled: viewState === 'chat' && ! messages.length,
			onClick: handleNewChat,
		};
		const undockMenuItem = {
			icon: login,
			title: __( 'Pop out sidebar', '__i18n_text_domain__' ),
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
			title: __( 'Move to sidebar', '__i18n_text_domain__' ),
			onClick: dock,
		};

		// Build the header menu: always show "New chat", then add dock/undock based on layout
		const chatHeaderOptions: ChatHeaderOptions = [ newChatMenuItem ];

		if ( isDocked ) {
			chatHeaderOptions.push( undockMenuItem );
		} else if ( isDesktop ) {
			chatHeaderOptions.push( dockMenuItem );
		}

		// User is browsing past conversations
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
							title={ __( 'Past chats', '__i18n_text_domain__' ) }
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

		// Main chat view with messages and input
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
					isLoadingConversation ? (
						<ChatMessageSkeleton count={ 3 } />
					) : (
						<EmptyView
							heading={ __( 'Howdy! How can I help you today?', '__i18n_text_domain__' ) }
							help={ __( 'Got a different request? Ask away.', '__i18n_text_domain__' ) }
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

	// Don't render anything until we know the user's preferences
	if ( ! persistedState.hasLoaded ) {
		return null;
	}

	return createChatPortal( renderAgentUI() );
}
