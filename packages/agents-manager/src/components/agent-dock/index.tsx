import {
	createOdieBotId,
	getAgentManager,
	useAgentChat,
	type Message,
	type UseAgentChatConfig,
} from '@automattic/agenttic-client';
import { AgentUI, createMessageRenderer, EmptyView, type ChatState } from '@automattic/agenttic-ui';
import { useCallback, useEffect, useMemo, useState, useRef } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { comment, drawerRight, login } from '@wordpress/icons';
import orchestratorConfig, { AGENT_ID, createAgentConfig } from '../../config/agent-config';
import useChatLayoutManager from '../../hooks/use-chat-layout-manager';
import { usePersistedAgentState } from '../../hooks/use-persisted-agent-state';
import { lastConversationCache } from '../../utils/conversation-cache';
import BigSkyIcon from '../big-sky-icon';
import ChatHeader, { type Options as ChatHeaderOptions } from '../chat-header';
import { AI } from '../icons';
import { getWpAdminEmptyViewSuggestions, getCiabAdminEmptyViewSuggestions } from './suggestions';
import type { DockViewState } from './types';
import type { ContextAdapter } from '../../adapters/context/context-adapter';

export interface AgentDockProps {
	context: 'wp-admin' | 'ciab-admin' | 'block-editor';
	agentConfig: UseAgentChatConfig;
	siteId?: number;
	sessionId: string;
	resetSession: () => string;
	applySessionId: ( sessionId: string ) => void;
	contextAdapter?: ContextAdapter;
	preferenceKey?: string;
	savePreference?: ( key: string, value: any ) => Promise< void >;
	loadPreference?: ( key: string ) => Promise< any >;
}

const CHAT_OPEN_STORAGE_KEY = 'agents-manager-chat-is-open';
const CHAT_DOCKED_STORAGE_KEY = 'agents-manager-chat-is-docked';

export default function AgentDock( {
	context,
	agentConfig,
	siteId,
	sessionId,
	resetSession,
	applySessionId,
	preferenceKey = 'agents-manager-chat-state',
	savePreference,
	loadPreference,
}: AgentDockProps ) {
	const [ viewState, setViewState ] = useState< DockViewState >( 'chat' );
	const loadedSessionIdRef = useRef< string | null >( null );
	const { messages, isProcessing, error, onSubmit, loadMessages } = useAgentChat( agentConfig );

	// Persisted state for /me/preferences
	const {
		state: persistedState,
		setSessionId: setPersistedSessionId,
		setIsOpen: setPersistedIsOpen,
		setIsDocked: setPersistedIsDocked,
		isLoading: isLoadingPersistedState,
	} = usePersistedAgentState( {
		preferenceKey,
		savePreference,
		loadPreference,
	} );

	const defaultOpen = useMemo( () => {
		// Use persisted state if available
		if ( persistedState.isOpen !== undefined ) {
			return persistedState.isOpen;
		}
		// Fallback to localStorage
		try {
			const stored = localStorage.getItem( CHAT_OPEN_STORAGE_KEY );
			return stored === 'true'; // Default to closed
		} catch {
			return false;
		}
	}, [ persistedState.isOpen ] );

	const defaultUndocked = useMemo( () => {
		// Use persisted state if available
		if ( persistedState.isDocked !== undefined ) {
			return persistedState.isDocked;
		}
		// Fallback to localStorage
		try {
			const stored = localStorage.getItem( CHAT_DOCKED_STORAGE_KEY );
			return stored === 'true'; // Default to undocked (floating)
		} catch {
			return false;
		}
	}, [ persistedState.isDocked ] );

	const setChatIsOpen = useCallback( () => {
		if ( ! isLoadingPersistedState ) {
			setPersistedIsOpen( true );
		}

		try {
			localStorage.setItem( CHAT_OPEN_STORAGE_KEY, 'true' );
		} catch {
			// Ignore errors
		}
	}, [ isLoadingPersistedState, setPersistedIsOpen ] );

	const setChatIsClosed = useCallback( () => {
		if ( ! isLoadingPersistedState ) {
			setPersistedIsOpen( false );
		}

		try {
			localStorage.setItem( CHAT_OPEN_STORAGE_KEY, 'false' );
		} catch {
			// Ignore errors
		}
	}, [ isLoadingPersistedState, setPersistedIsOpen ] );

	const setChatIsDocked = useCallback( () => {
		if ( ! isLoadingPersistedState ) {
			setPersistedIsDocked( true );
		}

		try {
			localStorage.setItem( CHAT_DOCKED_STORAGE_KEY, 'true' );
		} catch {
			// Ignore errors
		}
	}, [ isLoadingPersistedState, setPersistedIsDocked ] );

	const setChatIsUndocked = useCallback( () => {
		if ( ! isLoadingPersistedState ) {
			setPersistedIsDocked( false );
		}

		try {
			localStorage.setItem( CHAT_DOCKED_STORAGE_KEY, 'false' );
		} catch {
			// Ignore errors
		}
	}, [ isLoadingPersistedState, setPersistedIsDocked ] );

	const [ chatState, setChatState ] = useState< ChatState >(
		defaultOpen ? 'expanded' : 'collapsed'
	);

	const { isDocked, isDesktop, dock, undock, closeSidebar, createChatPortal } =
		useChatLayoutManager( 'body', {
			onOpenSidebar: setChatIsOpen,
			onCloseSidebar: setChatIsClosed,
			onDock: setChatIsDocked,
			onUndock: () => {
				setChatIsUndocked();
				// Ensure chat is open when undocking
				setChatState( 'expanded' );
				setChatIsOpen();
			},
			defaultOpen,
			defaultUndocked,
		} );

	// Sync sessionId with persisted state
	useEffect( () => {
		if ( ! isLoadingPersistedState && sessionId ) {
			setPersistedSessionId( sessionId );
		}
	}, [ sessionId, setPersistedSessionId, isLoadingPersistedState ] );

	// Update agent's sessionId when sessionId prop changes
	useEffect( () => {
		if ( ! sessionId ) {
			return;
		}

		const agentManager = getAgentManager();
		const agentKey = AGENT_ID;

		if ( agentManager.hasAgent( agentKey ) ) {
			agentManager.updateSessionId( agentKey, sessionId );
		}
	}, [ sessionId ] );

	// Update cache whenever messages change
	useEffect( () => {
		if ( messages.length === 0 || ! sessionId ) {
			return;
		}

		const agentManager = getAgentManager();
		const agentKey = AGENT_ID;

		if ( ! agentManager.hasAgent( agentKey ) ) {
			return;
		}

		// Get Message[] from agentManager and cache it
		const clientMessages = agentManager.getConversationHistory( agentKey );
		if ( clientMessages.length > 0 ) {
			const botId = createOdieBotId( AGENT_ID );
			lastConversationCache.set( botId, sessionId, clientMessages );
		}
	}, [ messages, sessionId ] );

	// Memoized callback for when conversation loads from server
	const onLoaded = useCallback(
		async ( loadedMessages: Message[], serverSessionId: string ) => {
			const agentManager = getAgentManager();
			const agentKey = AGENT_ID;

			// Agent should already be created by useAgentChat, but check just in case
			if ( ! agentManager.hasAgent( agentKey ) ) {
				const newConfig = await createAgentConfig( serverSessionId, siteId );
				await agentManager.createAgent( agentKey, {
					...newConfig,
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
				} catch ( _error ) {
					// eslint-disable-next-line no-console
					console.error( 'Failed to apply session ID:', _error );
					return;
				}
			}

			// Track that we've loaded this session (after successful validation)
			loadedSessionIdRef.current = serverSessionId;
		},
		[ applySessionId, loadMessages, sessionId, siteId ]
	);

	const handleNewChat = useCallback( async () => {
		const agentManager = getAgentManager();
		const agentKey = AGENT_ID;

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
	}, [ resetSession ] );

	// Custom message renderer that uses our markdown components
	const messageRenderer = useMemo(
		() =>
			createMessageRenderer( {
				components: orchestratorConfig.markdownComponents(),
				extensions: orchestratorConfig.markdownExtensions(),
			} ),
		[]
	);

	const renderAgentUI = () => {
		// TODO: Switch to "New chat"...
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

		return (
			<AgentUI.Container
				messages={ messages }
				isProcessing={ isProcessing }
				error={ error }
				onSubmit={ onSubmit }
				variant={ isDocked ? 'embedded' : 'floating' }
				floatingChatState={ chatState }
				onClose={ isDocked ? closeSidebar : () => setChatState( 'collapsed' ) }
				onExpand={ () => setChatState( 'expanded' ) }
				className="agenttic"
				messageRenderer={ messageRenderer }
				emptyView={
					<EmptyView
						heading={ __( 'Howdy! How can I help you today?', 'agents-manager' ) }
						help={ __( 'Got a different request? Ask away.', 'agents-manager' ) }
						suggestions={
							context === 'ciab-admin'
								? getCiabAdminEmptyViewSuggestions()
								: getWpAdminEmptyViewSuggestions()
						}
						icon={ isDocked ? <AI /> : <BigSkyIcon width={ 64 } height={ 64 } /> }
					/>
				}
			>
				<AgentUI.ConversationView>
					<ChatHeader
						isChatDocked={ isDocked }
						onClose={ isDocked ? closeSidebar : () => setChatState( 'collapsed' ) }
						options={ chatHeaderOptions }
					/>
					<AgentUI.Messages />
					<AgentUI.Footer>
						<AgentUI.Suggestions />
						<AgentUI.Notice />
						<AgentUI.Input />
					</AgentUI.Footer>
				</AgentUI.ConversationView>
			</AgentUI.Container>
		);
	};

	return createChatPortal( renderAgentUI() );
}
