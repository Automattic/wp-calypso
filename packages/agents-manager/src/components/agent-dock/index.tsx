/**
 * Agent Dock Component
 *
 * Manages the floating/docked chat interface, sessions, conversation history, and routing.
 */

import {
	createOdieBotId,
	getAgentManager,
	useAgentChat,
	type Message,
	type UseAgentChatConfig,
	type SubmitOptions,
} from '@automattic/agenttic-client';
import {
	type MarkdownComponents,
	type MarkdownExtensions,
	type Suggestion,
} from '@automattic/agenttic-ui';
import { useManagedOdieChat } from '@automattic/odie-client';
import { useDispatch, useSelect } from '@wordpress/data';
import { useCallback, useEffect, useRef } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { comment, drawerRight, login, backup } from '@wordpress/icons';
import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../../constants';
import useAgentLayoutManager from '../../hooks/use-agent-layout-manager';
import useLoadConversation from '../../hooks/use-load-conversation';
import { AGENTS_MANAGER_STORE } from '../../stores';
import { getSessionId, setSessionId, clearSessionId } from '../../utils/agent-session';
import { lastConversationCache } from '../../utils/conversation-cache';
import AgentChat from '../agent-chat';
import AgentHistory from '../agent-history';
import { type Options as ChatHeaderOptions } from '../chat-header';
import SupportGuide from '../support-guide';
import SupportGuides from '../support-guides';
import type { AgentsManagerSelect, HelpCenterSite } from '@automattic/data-stores';

/**
 * Navigation continuation hook type
 */
type NavigationContinuationHook = ( props: {
	isProcessing: boolean;
	onSubmit: ( message: string, options?: SubmitOptions ) => Promise< void >;
	sessionId: string;
	agentId: string;
} ) => void;

interface AgentDockProps {
	/** The selected site object. */
	site?: HelpCenterSite | null;
	/** The name of the current section (e.g., 'posts', 'pages'). */
	sectionName: string;
	/** Indicates if the user is eligible for chat. */
	isEligibleForChat: boolean;
	/** Agent configuration for the chat client. */
	agentConfig: UseAgentChatConfig;
	/** Suggestions displayed when the chat is empty. */
	emptyViewSuggestions?: Suggestion[];
	/** Custom components for rendering markdown. */
	markdownComponents?: MarkdownComponents;
	/** Custom markdown extensions. */
	markdownExtensions?: MarkdownExtensions;
	/** Navigation continuation hook for post-navigation conversation resumption. */
	useNavigationContinuation?: NavigationContinuationHook;
}

export default function AgentDock( {
	agentConfig,
	site,
	sectionName,
	isEligibleForChat,
	emptyViewSuggestions = [],
	markdownComponents = {},
	markdownExtensions = {},
	useNavigationContinuation,
}: AgentDockProps ) {
	const { setIsOpen } = useDispatch( AGENTS_MANAGER_STORE );
	const { hasLoaded: isStoreReady, isOpen = false } = useSelect( ( select ) => {
		const store: AgentsManagerSelect = select( AGENTS_MANAGER_STORE );
		return store.getAgentsManagerState();
	}, [] );
	// Tracks which session we've already loaded to avoid redundant fetches
	const loadedSessionIdRef = useRef< string | null >( null );
	const { pathname, state } = useLocation();
	const navigate = useNavigate();

	// Use persisted route state `sessionId` if available, otherwise fall back to stored `sessionId`
	const sessionId = state?.sessionId || getSessionId();
	const agentId = agentConfig.agentId;

	const { isDocked, isDesktop, dock, undock, closeSidebar, createAgentPortal } =
		useAgentLayoutManager();

	const {
		messages,
		suggestions,
		isProcessing,
		error,
		loadMessages,
		onSubmit,
		abortCurrentRequest,
	} = useAgentChat( agentConfig );

	const {
		messages: odieMessages,
		isProcessing: isOdieProcessing,
		sendMessage: sendOdieMessage,
	} = useManagedOdieChat();

	// Handle navigation continuation if hook is provided
	// This allows to resume conversations after full page navigation
	useNavigationContinuation?.( {
		isProcessing,
		onSubmit,
		sessionId,
		agentId,
	} );

	// Update the last conversation cache whenever messages change
	useEffect( () => {
		if ( ! messages.length || ! sessionId ) {
			return;
		}

		const agentManager = getAgentManager();

		if ( ! agentManager.hasAgent( agentId ) ) {
			return;
		}

		const clientMessages = agentManager.getConversationHistory( agentId );
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

			// Sync storage and URL if the server assigned a different session ID
			if ( serverSessionId && sessionId !== serverSessionId ) {
				setSessionId( serverSessionId );
				navigate( '/chat', { state: { sessionId: serverSessionId }, replace: true } );
			}

			// Remember that we loaded this session so we don't load it again
			loadedSessionIdRef.current = serverSessionId;
		},
		[ agentId, loadMessages, navigate, sessionId ]
	);

	// Hook that handles fetching conversation history from the server
	const { loadConversation, isLoading: isLoadingConversation } = useLoadConversation( {
		apiBaseUrl: API_BASE_URL,
		authProvider: agentConfig.authProvider,
		onLoaded,
	} );

	// Function to load a conversation if not already loaded
	const maybeLoadConversation = useCallback(
		( sessionId: string ) => {
			if ( ! sessionId || loadedSessionIdRef.current === sessionId ) {
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
		() => maybeLoadConversation( sessionId ),
		// eslint-disable-next-line react-hooks/exhaustive-deps -- Only run on mount
		[]
	);

	// Start a brand new chat, wiping out everything from the current one
	const handleNewChat = useCallback( async () => {
		const agentManager = getAgentManager();

		if ( agentManager.hasAgent( agentId ) ) {
			abortCurrentRequest();
			// Clear out the current messages
			await loadMessages( [] );

			// Start fresh: remove the old agent and create a new one without a session.
			// The server will give us a new session ID once the user sends a message.
			agentManager.removeAgent( agentId );
			await agentManager.createAgent( agentId, { ...agentConfig, sessionId: '' } );
		}

		// Wipe all saved data
		lastConversationCache.clear();
		clearSessionId();
		loadedSessionIdRef.current = null;

		// Navigate to the base chat route if not already there
		if ( pathname !== '/' ) {
			navigate( '/' );
		}
	}, [ abortCurrentRequest, agentConfig, agentId, loadMessages, navigate, pathname ] );

	// User picked a past conversation from history, so load it up
	const handleSelectConversation = useCallback(
		( sessionId: string ) => {
			const agentManager = getAgentManager();

			if ( ! agentManager.hasAgent( agentId ) ) {
				// eslint-disable-next-line no-console
				console.warn( '[AgentDock] Agent not found, skipping conversation selection' );
				return;
			}

			abortCurrentRequest();
			agentManager.updateSessionId( agentId, sessionId );
			setSessionId( sessionId );
			maybeLoadConversation( sessionId );

			navigate( '/chat', { state: { sessionId } } );
		},
		[ abortCurrentRequest, agentId, maybeLoadConversation, navigate ]
	);

	const getChatHeaderOptions = (): ChatHeaderOptions => {
		const isHistoryView = pathname === '/history';

		const newChatMenuItem = {
			icon: comment,
			title: __( 'New chat', '__i18n_text_domain__' ),
			isDisabled: ! isHistoryView && ! messages.length,
			onClick: handleNewChat,
		};
		const historyMenuItem = {
			icon: backup,
			title: __( 'View history', 'agents-manager' ),
			isDisabled: isHistoryView,
			onClick: () => navigate( '/history' ),
		};
		const undockMenuItem = {
			icon: login,
			title: __( 'Pop out sidebar', '__i18n_text_domain__' ),
			onClick: () => {
				// TODO: Persist floating chat position...
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

		const options: ChatHeaderOptions = [ newChatMenuItem, historyMenuItem ];

		if ( isDocked ) {
			options.push( undockMenuItem );
		} else if ( isDesktop ) {
			options.push( dockMenuItem );
		}

		return options;
	};

	const Chat = (
		<AgentChat
			messages={ messages }
			suggestions={ suggestions }
			isProcessing={ isProcessing }
			error={ error }
			onSubmit={ onSubmit }
			onAbort={ abortCurrentRequest }
			isLoadingConversation={ isLoadingConversation }
			isDocked={ isDocked }
			isOpen={ isOpen }
			onClose={ isDocked ? closeSidebar : () => setIsOpen( false ) }
			onExpand={ () => setIsOpen( true ) }
			chatHeaderOptions={ getChatHeaderOptions() }
			markdownComponents={ markdownComponents }
			markdownExtensions={ markdownExtensions }
			emptyViewSuggestions={ emptyViewSuggestions }
		/>
	);

	const OdieChat = (
		<AgentChat
			messages={ odieMessages }
			suggestions={ [] }
			isProcessing={ isOdieProcessing }
			error={ null }
			onSubmit={ sendOdieMessage }
			onAbort={ () => {} }
			isLoadingConversation={ isLoadingConversation }
			isDocked={ isDocked }
			isOpen={ isOpen }
			onClose={ isDocked ? closeSidebar : () => setIsOpen( false ) }
			onExpand={ () => setIsOpen( true ) }
			chatHeaderOptions={ getChatHeaderOptions() }
			markdownComponents={ markdownComponents }
			markdownExtensions={ markdownExtensions }
			emptyViewSuggestions={ emptyViewSuggestions }
		/>
	);

	const History = (
		<AgentHistory
			agentId={ agentId }
			authProvider={ agentConfig.authProvider }
			chatHeaderOptions={ getChatHeaderOptions() }
			isDocked={ isDocked }
			isOpen={ isOpen }
			onSubmit={ onSubmit }
			onAbort={ abortCurrentRequest }
			onClose={ isDocked ? closeSidebar : () => setIsOpen( false ) }
			onExpand={ () => setIsOpen( true ) }
			onSelectConversation={ handleSelectConversation }
			onNewChat={ handleNewChat }
		/>
	);

	const SupportGuideRoute = (
		<SupportGuide
			isEligibleForChat={ isEligibleForChat }
			onAbort={ abortCurrentRequest }
			onClose={ closeSidebar }
			isOpen={ isOpen }
			sectionName={ sectionName }
			currentSiteDomain={ site?.domain }
			chatHeaderOptions={ getChatHeaderOptions() }
			isChatDocked={ isDocked }
		/>
	);

	const SupportGuidesRoute = (
		<SupportGuides
			onAbort={ abortCurrentRequest }
			onClose={ closeSidebar }
			isOpen={ isOpen }
			chatHeaderOptions={ getChatHeaderOptions() }
			isChatDocked={ isDocked }
		/>
	);

	if ( ! isStoreReady ) {
		return null;
	}

	return createAgentPortal(
		<Routes>
			<Route path="/" element={ Chat } />
			<Route path="/odie" element={ OdieChat } />
			<Route path="/chat" element={ Chat } />
			<Route path="/post" element={ SupportGuideRoute } />
			<Route path="/support-guides" element={ SupportGuidesRoute } />
			<Route path="/history" element={ History } />
			<Route path="*" element={ <Navigate to="/" replace /> } />
		</Routes>
	);
}
