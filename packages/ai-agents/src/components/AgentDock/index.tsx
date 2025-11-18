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
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAgentSession } from '../../hooks/useAgentSession';
import { useChatState } from '../../hooks/useChatState';
import AgentsManager from '../AgentsManager';
import type { ChromeAdapter } from '../../adapters/chrome/ChromeAdapter';
import type { ContextAdapter } from '../../adapters/context/ContextAdapter';

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
}

/**
 * AgentDock Component
 *
 * Full-featured AI agent chat with docking/floating modes and context awareness.
 *
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
}: AgentDockProps ) {
	const { sessionId, resetSession } = useAgentSession( {
		storageKey: sessionStorageKey,
	} );
	const { chatState, toggleExpand, collapse, expand } = useChatState( {
		storageKey: chatStateStorageKey,
	} );

	// Dock state from localStorage
	const [ isDocked, setIsDocked ] = useState( () => {
		try {
			const stored = localStorage.getItem( dockStateStorageKey );
			return stored !== 'false'; // Default to docked
		} catch {
			return true;
		}
	} );

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
		}: {
			isDocked: boolean;
			isDesktop: boolean;
			closeSidebar: () => void;
			dock: () => void;
			undock: () => void;
		} ) => {
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
						{ /* TODO: Add custom chat header with menu items */ }
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
			handleDock,
			handleUndock,
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
