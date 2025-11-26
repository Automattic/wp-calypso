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
import { AgentsManagerSelect } from '@automattic/data-stores';
import { useDispatch, useSelect } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
import { comment, drawerRight, login } from '@wordpress/icons';
import { useCallback, useMemo } from 'react';
import { useAgentSession } from '../../hooks/use-agent-session';
import useChatLayoutManager from '../../hooks/use-chat-layout-manager';
import { AGENTS_MANAGER_STORE } from '../../stores';
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
}: AgentDockProps ) {
	const { setIsOpen } = useDispatch( AGENTS_MANAGER_STORE );
	const persistedState = useSelect( ( select ) => {
		const store: AgentsManagerSelect = select( AGENTS_MANAGER_STORE );
		return store.getAgentsManagerState();
	}, [] );

	const { sessionId, resetSession } = useAgentSession( {
		storageKey: sessionStorageKey,
	} );

	const chatState = persistedState.isOpen ? 'expanded' : 'collapsed';

	const setChatIsOpen = useCallback( () => {
		setIsOpen( true );
	}, [ setIsOpen ] );

	const setChatIsClosed = useCallback( () => {
		setIsOpen( false );
	}, [ setIsOpen ] );

	const { isDocked, isDesktop, dock, undock, closeSidebar, createChatPortal } =
		useChatLayoutManager( 'body' );

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
				onClose={ isDocked ? closeSidebar : setChatIsClosed }
				onExpand={ setChatIsOpen }
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
						onClose={ isDocked ? closeSidebar : setChatIsClosed }
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

	// Wait user's preferences to be loaded
	if ( ! persistedState.hasLoaded ) {
		return null;
	}

	return createChatPortal( renderAgentUI() );
}
