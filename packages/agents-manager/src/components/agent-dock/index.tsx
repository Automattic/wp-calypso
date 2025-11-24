/**
 * Agent Dock Component
 * Provides floating + docked mode AI chat using @automattic/agenttic-ui
 */

import {
	getAgentManager,
	useAgentChat,
	type UseAgentChatConfig,
} from '@automattic/agenttic-client';
import { AgentUI, createMessageRenderer, EmptyView, type ChatState } from '@automattic/agenttic-ui';
import { __ } from '@wordpress/i18n';
import { comment, drawerRight, login } from '@wordpress/icons';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAgentSession } from '../../hooks/use-agent-session';
import useChatLayoutManager from '../../hooks/use-chat-layout-manager';
import { usePersistedAgentState } from '../../hooks/use-persisted-agent-state';
import BigSkyIcon from '../big-sky-icon';
import ChatHeader, { type Options as ChatHeaderOptions } from '../chat-header';
import { AI } from '../icons';
import type { ContextAdapter } from '../../adapters/context/context-adapter';

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
	 * Custom empty view suggestions
	 */
	emptyViewSuggestions?: Array< { id?: string; label: string; prompt: string } >;
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

const CHAT_OPEN_STORAGE_KEY = 'agents-manager-chat-is-open';
const CHAT_DOCKED_STORAGE_KEY = 'agents-manager-chat-is-docked';

/**
 * AgentDock Component
 *
 * Full-featured AI agent chat with docking/floating modes and context awareness.
 * @param {AgentDockProps} props - Component props
 */
export default function AgentDock( {
	agentConfig,
	emptyViewSuggestions = [],
	markdownComponents = {},
	markdownExtensions,
	onClearChat,
	sessionStorageKey = 'agents-manager-session',
	preferenceKey = 'agents-manager-chat-state',
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

	const renderAgentUI = () => {
		const resetChatMenuItem = {
			icon: comment,
			title: __( 'Reset chat', 'agents-manager' ),
			isDisabled: ! messages.length,
			onClick: handleClearChat,
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

		const chatHeaderOptions: ChatHeaderOptions = [ resetChatMenuItem ];

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
						suggestions={ suggestions }
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
