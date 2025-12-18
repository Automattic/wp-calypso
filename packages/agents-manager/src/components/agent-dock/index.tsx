import {
	getAgentManager,
	useAgentChat,
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
import { __ } from '@wordpress/i18n';
import { comment, drawerRight, login } from '@wordpress/icons';
import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import useAdminBarIntegration from '../../hooks/use-admin-bar-integration';
import useAgentLayoutManager from '../../hooks/use-agent-layout-manager';
import useConversation from '../../hooks/use-conversation';
import { AGENTS_MANAGER_STORE } from '../../stores';
import { setSessionId } from '../../utils/agent-session';
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
	const { pathname } = useLocation();
	const navigate = useNavigate();

	const sessionId = agentConfig.sessionId;
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

	const { isLoading: isLoadingConversation } = useConversation( {
		agentId,
		sessionId,
		authProvider: agentConfig.authProvider,
		onSuccess: ( messages, serverSessionId ) => {
			// Update the UI with the loaded messages
			loadMessages( messages );
			// Make sure future messages go to the right session
			getAgentManager().updateSessionId( agentId, serverSessionId );

			// Sync local session ID with the server's
			if ( sessionId !== serverSessionId ) {
				setSessionId( serverSessionId );
				navigate( '/chat', { state: { sessionId: serverSessionId }, replace: true } );
			}
		},
	} );

	// Handle navigation continuation if hook is provided
	// This allows to resume conversations after full page navigation
	useNavigationContinuation?.( {
		isProcessing,
		onSubmit,
		sessionId,
		agentId,
	} );

	// Handle WordPress admin bar integration
	useAdminBarIntegration( {
		isOpen,
		sectionName,
		setIsOpen,
		navigate,
	} );

	const handleNewChat = () => {
		navigate( '/' );
	};

	const handleSelectConversation = ( sessionId: string ) => {
		abortCurrentRequest();
		setSessionId( sessionId );
		navigate( '/chat', { state: { sessionId } } );
	};

	const getChatHeaderOptions = (): ChatHeaderOptions => {
		const newChatMenuItem = {
			icon: comment,
			title: __( 'New chat', '__i18n_text_domain__' ),
			isDisabled: pathname !== '/history' && ! messages.length,
			onClick: handleNewChat,
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

		const options: ChatHeaderOptions = [ newChatMenuItem ];

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
		// NOTE: Use route state to pass data that needs to be accessed throughout the app.
		<Routes>
			<Route path="/odie" element={ OdieChat } />
			<Route path="/chat" element={ Chat } />
			<Route path="/post" element={ SupportGuideRoute } />
			<Route path="/support-guides" element={ SupportGuidesRoute } />
			<Route path="/history" element={ History } />
			<Route path="*" element={ <Navigate to="/chat" state={ { isNewChat: true } } replace /> } />
		</Routes>
	);
}
