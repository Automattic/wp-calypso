/**
 * Agent Dock Component
 * Provides floating + docked mode AI chat using @automattic/agenttic-ui
 */

import {
	getAgentManager,
	useAgentChat,
	type UseAgentChatConfig,
} from '@automattic/agenttic-client';
import { AgentUI, createMessageRenderer, EmptyView } from '@automattic/agenttic-ui';
import { __ } from '@wordpress/i18n';
import { drawerRight, login, rotateRight } from '@wordpress/icons';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAgentSession } from '../../hooks/useAgentSession';
import { useChatState } from '../../hooks/useChatState';
import { usePersistedAgentState } from '../../hooks/usePersistedAgentState';
import AgentsManager from '../AgentsManager';
import ChatHeader from '../shared/ChatHeader';
import type { ChromeAdapter } from '../../adapters/chrome/ChromeAdapter';
import type { ContextAdapter } from '../../adapters/context/ContextAdapter';
import type { ChatHeaderMenuItem } from '../shared/ChatHeader';

export interface AgentDockProps {
	/**
	 * Agent configuration for @automattic/agenttic-client
	 */
	agentConfig: UseAgentChatConfig;
	/**
	 * Context adapter for providing environment context
	 */
	contextAdapter?: ContextAdapter;
	/**
	 * Chrome adapter for DOM manipulation
	 */
	chromeAdapter?: ChromeAdapter;
	/**
	 * Container selector for the sidebar
	 */
	containerSelector: string;
	/**
	 * Custom empty view suggestions
	 */
	emptyViewSuggestions?: Array< { id?: string; label: string; prompt: string } >;
	/**
	 * Custom empty view heading
	 */
	emptyViewHeading?: string;
	/**
	 * Custom empty view help text
	 */
	emptyViewHelp?: string;
	/**
	 * Custom message renderer components
	 */
	markdownComponents?: Record< string, any >;
	/**
	 * Custom markdown extensions
	 */
	markdownExtensions?: any;
	/**
	 * Callback when chat is cleared
	 */
	onClearChat?: () => void;
	/**
	 * Storage key for session persistence
	 */
	sessionStorageKey?: string;
	/**
	 * Storage key for chat state persistence
	 */
	chatStateStorageKey?: string;
	/**
	 * Storage key for dock state persistence
	 */
	dockStateStorageKey?: string;
	/**
	 * Storage key for /me/preferences persistence
	 */
	preferenceKey?: string;
	/**
	 * Function to save preferences to server
	 */
	savePreference?: ( key: string, value: any ) => Promise< void >;
	/**
	 * Function to load preferences from server
	 */
	loadPreference?: ( key: string ) => Promise< any >;
}

/**
 * AgentDock Component
 *
 * Full-featured AI agent chat with docking/floating modes and context awareness.
 * @param {AgentDockProps} props - Component props
 */
export default function AgentDock( {
	agentConfig,
	chromeAdapter,
	containerSelector,
	emptyViewSuggestions = [],
	emptyViewHeading = __( 'How can I help you today?', 'ai-agents' ),
	emptyViewHelp = __( 'Ask me anything.', 'ai-agents' ),
	markdownComponents = {},
	markdownExtensions,
	onClearChat,
	sessionStorageKey = 'ai-agent-session',
	chatStateStorageKey = 'ai-agent-chat-state',
	dockStateStorageKey = 'ai-agent-docked',
	preferenceKey = 'ai_agent_state',
	savePreference,
	loadPreference,
}: AgentDockProps ) {
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

	const { sessionId, resetSession } = useAgentSession( {
		storageKey: sessionStorageKey,
	} );

	const { chatState, toggleExpand, collapse, expand } = useChatState( {
		storageKey: chatStateStorageKey,
	} );

	// Dock state from localStorage (fallback) and persisted state
	const [ isDocked, setIsDocked ] = useState( () => {
		// Use persisted state if available
		if ( persistedState.isDocked !== undefined ) {
			return persistedState.isDocked;
		}
		// Fallback to localStorage
		try {
			const stored = localStorage.getItem( dockStateStorageKey );
			return stored !== 'false'; // Default to docked
		} catch {
			return true;
		}
	} );

	// Sync sessionId with persisted state
	useEffect( () => {
		if ( ! isLoadingPersistedState && sessionId ) {
			setPersistedSessionId( sessionId );
		}
	}, [ sessionId, setPersistedSessionId, isLoadingPersistedState ] );

	// Sync chatState with persisted isOpen
	useEffect( () => {
		if ( ! isLoadingPersistedState ) {
			const isOpen = chatState === 'expanded';
			setPersistedIsOpen( isOpen );
		}
	}, [ chatState, setPersistedIsOpen, isLoadingPersistedState ] );

	// Sync isDocked with persisted state
	useEffect( () => {
		if ( ! isLoadingPersistedState ) {
			setPersistedIsDocked( isDocked );
		}
	}, [ isDocked, setPersistedIsDocked, isLoadingPersistedState ] );

	const { messages, isProcessing, error, onSubmit } = useAgentChat( agentConfig );

	// Apply chrome when docked and expanded
	useEffect( () => {
		if ( ! chromeAdapter ) {
			return;
		}

		chromeAdapter.applyChrome( isDocked, chatState !== 'expanded' );

		return () => {
			chromeAdapter.removeChrome();
		};
	}, [ chromeAdapter, isDocked, chatState ] );

	// TODO: Use this when adding custom chat header with clear chat menu item
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const handleClearChat = useCallback( async () => {
		const agentManager = getAgentManager();
		const agentKey = `${ agentConfig.agentId }-${ sessionId }`;

		if ( agentManager.hasAgent( agentKey ) ) {
			await agentManager.resetConversation( agentKey );
		}

		resetSession();
		onClearChat?.();
	}, [ sessionId, resetSession, agentConfig.agentId, onClearChat ] );

	const handleCollapse = useCallback( () => {
		collapse();
		if ( chromeAdapter && isDocked ) {
			chromeAdapter.applyChrome( isDocked, true ); // collapsed
		}
	}, [ collapse, chromeAdapter, isDocked ] );

	const handleExpand = useCallback( () => {
		expand();
		if ( chromeAdapter && isDocked ) {
			chromeAdapter.applyChrome( isDocked, false ); // expanded
		}
	}, [ expand, chromeAdapter, isDocked ] );

	const handleDock = useCallback( () => {
		setIsDocked( true );
		try {
			localStorage.setItem( dockStateStorageKey, 'true' );
		} catch {
			// Ignore storage errors
		}
	}, [ dockStateStorageKey ] );

	const handleUndock = useCallback( () => {
		setIsDocked( false );
		try {
			localStorage.setItem( dockStateStorageKey, 'false' );
		} catch {
			// Ignore storage errors
		}
		expand(); // Expand when undocking to floating mode
	}, [ dockStateStorageKey, expand ] );

	// Custom message renderer
	const messageRenderer = useMemo( () => {
		const options: any = { components: markdownComponents };
		if ( markdownExtensions ) {
			options.extensions = markdownExtensions;
		}
		return createMessageRenderer( options );
	}, [ markdownComponents, markdownExtensions ] );

	// Add IDs to suggestions if not provided
	const suggestions = useMemo(
		() =>
			emptyViewSuggestions.map( ( suggestion, index ) => ( {
				id: suggestion.id || `suggestion-${ index }`,
				label: suggestion.label,
				prompt: suggestion.prompt,
			} ) ),
		[ emptyViewSuggestions ]
	);

	const renderAgentUI = useCallback(
		( {
			isDocked: isDockedFromManager,
			closeSidebar,
			dock,
			undock,
		}: {
			isDocked: boolean;
			isDesktop: boolean;
			closeSidebar: () => void;
			dock: () => void;
			undock: () => void;
		} ) => {
			// Create menu items for chat header
			const menuItems: ChatHeaderMenuItem[] = [];

			// Add dock/undock menu item
			if ( isDockedFromManager ) {
				menuItems.push( {
					id: 'undock',
					icon: login,
					title: __( 'Pop out sidebar', 'ai-agents' ),
					onClick: undock,
				} );
			} else {
				menuItems.push( {
					id: 'dock',
					icon: drawerRight,
					title: __( 'Move to sidebar', 'ai-agents' ),
					onClick: dock,
				} );
			}

			// Add reset chat menu item
			menuItems.push( {
				id: 'reset',
				icon: rotateRight,
				title: __( 'Reset chat', 'ai-agents' ),
				onClick: handleClearChat,
			} );

			return (
				<AgentUI.Container
					messages={ messages }
					isProcessing={ isProcessing }
					error={ error }
					onSubmit={ onSubmit }
					variant={ isDockedFromManager ? 'embedded' : 'floating' }
					floatingChatState={ chatState }
					onClose={ isDockedFromManager ? closeSidebar : toggleExpand }
					onExpand={ toggleExpand }
					className="agenttic ai-agent-dock"
					messageRenderer={ messageRenderer }
					emptyView={
						<EmptyView
							heading={ emptyViewHeading }
							help={ emptyViewHelp }
							suggestions={ suggestions }
						/>
					}
				>
					<AgentUI.ConversationView>
						<ChatHeader
							isChatDocked={ isDockedFromManager }
							onClose={ isDockedFromManager ? closeSidebar : toggleExpand }
							options={ menuItems }
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
		},
		[
			messages,
			isProcessing,
			error,
			onSubmit,
			chatState,
			toggleExpand,
			messageRenderer,
			emptyViewHeading,
			emptyViewHelp,
			suggestions,
			handleClearChat,
		]
	);

	return (
		<AgentsManager
			sidebarContainer={ containerSelector }
			onOpenSidebar={ handleExpand }
			onCloseSidebar={ handleCollapse }
			onDock={ handleDock }
			onUndock={ handleUndock }
			defaultOpen={ chatState === 'expanded' }
			defaultUndocked={ ! isDocked }
		>
			{ renderAgentUI }
		</AgentsManager>
	);
}
