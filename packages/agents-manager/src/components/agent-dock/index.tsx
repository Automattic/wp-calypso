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
import { useAgentSession } from '../../hooks/use-agent-session';
import { useChatState } from '../../hooks/use-chat-state';
import { usePersistedAgentState } from '../../hooks/use-persisted-agent-state';
import ChatHeader from '../chat-header';
import ChatLayoutManager from '../chat-layout-manager';
import type { ContextAdapter } from '../../adapters/context/context-adapter';
import type { ChatHeaderMenuItem } from '../chat-header';

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
	 * Custom icon for FAB button
	 */
	fabIcon?: JSX.Element;
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
	/**
	 * Start with dock open (overrides saved state)
	 */
	defaultOpen?: boolean;
	/**
	 * Media query for desktop breakpoint (default: '(min-width: 960px)')
	 */
	desktopMediaQuery?: string;
}

/**
 * AgentDock Component
 *
 * Full-featured AI agent chat with docking/floating modes and context awareness.
 * @param {AgentDockProps} props - Component props
 */
export default function AgentDock( {
	agentConfig,
	containerSelector,
	emptyViewSuggestions = [],
	emptyViewHeading = __( 'How can I help you today?', 'agents-manager' ),
	emptyViewHelp = __( 'Ask me anything.', 'agents-manager' ),
	markdownComponents = {},
	markdownExtensions,
	fabIcon,
	onClearChat,
	sessionStorageKey = 'agents-manager-session',
	chatStateStorageKey = 'agents-manager-chat-state',
	dockStateStorageKey = 'agents-manager-docked',
	preferenceKey = 'agents-manager-state',
	savePreference,
	loadPreference,
	defaultOpen = false,
	desktopMediaQuery = '(min-width: 960px)',
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
			return stored === 'true'; // Default to undocked (floating)
		} catch {
			return false;
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
	}, [ collapse ] );

	const handleExpand = useCallback( () => {
		expand();
	}, [ expand ] );

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

	const renderAgentUI = ( {
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
				title: __( 'Pop out sidebar', 'agents-manager' ),
				onClick: undock,
			} );
		} else {
			menuItems.push( {
				id: 'dock',
				icon: drawerRight,
				title: __( 'Move to sidebar', 'agents-manager' ),
				onClick: dock,
			} );
		}

		// Add reset chat menu item (disabled if no messages or processing)
		menuItems.push( {
			id: 'reset',
			icon: rotateRight,
			title: __( 'Reset chat', 'agents-manager' ),
			onClick: handleClearChat,
			isDisabled: ! messages.length || isProcessing,
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
				className="agenttic agents-manager-dock"
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
	};

	// Determine if sidebar should be open by default
	// Priority: defaultOpen prop > chatState from storage
	const shouldBeOpen = defaultOpen || chatState === 'expanded';

	return (
		<ChatLayoutManager
			sidebarContainer={ containerSelector }
			onOpenSidebar={ handleExpand }
			onCloseSidebar={ handleCollapse }
			onDock={ handleDock }
			onUndock={ handleUndock }
			defaultOpen={ shouldBeOpen }
			defaultUndocked={ ! isDocked }
			desktopMediaQuery={ desktopMediaQuery }
			fabIcon={ fabIcon }
		>
			{ renderAgentUI }
		</ChatLayoutManager>
	);
}
