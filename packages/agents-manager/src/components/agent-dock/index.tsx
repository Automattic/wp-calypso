import { getAgentManager } from '@automattic/agenttic-client';
import {
	type MarkdownComponents,
	type MarkdownExtensions,
	type Suggestion,
} from '@automattic/agenttic-ui';
import { useDispatch, useSelect } from '@wordpress/data';
import { useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { comment, drawerRight, login, lifesaver } from '@wordpress/icons';
import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAgentsManagerContext } from '../../contexts';
import useAdminBarIntegration from '../../hooks/use-admin-bar-integration';
import useAgentLayoutManager from '../../hooks/use-agent-layout-manager';
import useSetupCustomActions from '../../hooks/use-setup-custom-actions';
import { useShouldUseUnifiedAgent } from '../../hooks/use-should-use-unified-agent';
import { AGENTS_MANAGER_STORE } from '../../stores';
import { LocalConversationListItem } from '../../types';
import { setSessionId } from '../../utils/agent-session';
import AgentHistory from '../agent-history';
import { type Options as ChatHeaderOptions } from '../chat-header';
import OrchestratorChat from '../orchestrator-chat';
import SupportGuide from '../support-guide';
import SupportGuides from '../support-guides';
import ZendeskChat from '../zendesk-chat';
import type {
	NavigationContinuationHook,
	AbilitiesSetupHook,
	GetChatComponent,
	UseSuggestionsHook,
	SiteBuildUtils,
	ImageUploadHook,
} from '../../utils/load-external-providers';
import type { AgentsManagerSelect } from '@automattic/data-stores';
import './style.scss';

interface Props {
	/** Suggestions displayed when the chat is empty. */
	emptyViewSuggestions?: Suggestion[];
	/** Custom components for rendering markdown. */
	markdownComponents?: MarkdownComponents;
	/** Custom markdown extensions. */
	markdownExtensions?: MarkdownExtensions;
	/** Navigation continuation hook for post-navigation conversation resumption. */
	useNavigationContinuation?: NavigationContinuationHook;
	/** Hook for setting up abilities that utilize React context. Invoked after custom actions registration. */
	useAbilitiesSetup?: AbilitiesSetupHook;
	/** Hook for providing dynamic suggestions based on context (e.g., selected block). */
	useSuggestions?: UseSuggestionsHook;
	/** Get a chat component by type for rendering in agent messages. */
	getChatComponent?: GetChatComponent;
	/** Utilities for site building flow (e.g., progress tracking, site preview). */
	siteBuildUtils?: SiteBuildUtils;
	/** Hook for handling image uploads within the agent chat. */
	useImageUpload?: ImageUploadHook;
}

export default function AgentDock( {
	emptyViewSuggestions = [],
	markdownComponents = {},
	markdownExtensions = {},
	useNavigationContinuation,
	useAbilitiesSetup,
	getChatComponent,
	useSuggestions,
	siteBuildUtils,
	useImageUpload,
}: Props ) {
	const { site, sectionName, isEligibleForChat, agentConfig } = useAgentsManagerContext();

	const [ isCompactMode, setIsCompactMode ] = useState(
		window.__agentsManagerActions?.isCompactMode ?? false
	);
	const [ shouldRenderChat, setShouldRenderChat ] = useState(
		window.__agentsManagerActions?.isChatEnabled ?? true
	);
	const [ desktopMediaQuery, setDesktopMediaQuery ] = useState< string | undefined >(
		window.__agentsManagerActions?.desktopMediaQuery
	);
	const [ orchestratorMsgCount, setOrchestratorMsgCount ] = useState( 0 );
	const [ zendeskMsgCount, setZendeskMsgCount ] = useState( 0 );
	const { setIsOpen, setIsDocked } = useDispatch( AGENTS_MANAGER_STORE );
	const { isOpen: isPersistedOpen = false, isDocked: isPersistedDocked = false } = useSelect(
		( select ) => {
			const store: AgentsManagerSelect = select( AGENTS_MANAGER_STORE );
			return store.getAgentsManagerState();
		},
		[]
	);
	const { pathname } = useLocation();
	const navigate = useNavigate();
	const shouldUseUnifiedAgent = useShouldUseUnifiedAgent();

	// `agentConfig` is guaranteed non-null here because AgentSetup guards rendering
	const agentId = agentConfig!.agentId;

	const { isDocked, canDock, dock, undock, openSidebar, closeSidebar, createAgentPortal } =
		useAgentLayoutManager( {
			defaultDocked: isPersistedDocked,
			defaultOpen: isPersistedOpen,
			desktopMediaQuery,
			onOpenSidebar: () => {
				setIsOpen( true );
				if ( pathname === '/history' ) {
					navigate( '/' );
				}
			},
			onCloseSidebar: () => setIsOpen( false ),
		} );

	// Handle WordPress admin bar integration
	useAdminBarIntegration( {
		isOpen: isPersistedOpen,
		sectionName,
		setIsOpen,
		navigate,
	} );

	useSetupCustomActions( {
		canDock,
		dock,
		undock,
		openSidebar,
		closeSidebar,
		setIsCompactMode,
		setShouldRenderChat,
		setDesktopMediaQuery,
	} );

	const handleAbort = () => getAgentManager().abortCurrentRequest( agentId );

	const handleNewChat = () => navigate( '/' );

	const handleClose = isDocked ? closeSidebar : () => setIsOpen( false );

	const handleExpand = () => {
		setIsOpen( true );
		if ( pathname === '/history' ) {
			navigate( '/' );
		}
	};

	const handleSelectConversation = ( conversation: LocalConversationListItem ) => {
		if ( conversation.is_zendesk ) {
			navigate( '/zendesk', { state: { conversationId: conversation.conversation_id } } );
		} else {
			const sessionId = conversation.session_id || '';

			handleAbort();
			setSessionId( sessionId, agentId );
			navigate( '/chat', { state: { sessionId } } );
		}
	};

	const getChatHeaderOptions = (): ChatHeaderOptions => {
		return [
			{
				icon: comment,
				title: __( 'New chat', '__i18n_text_domain__' ),
				isDisabled: pathname === '/chat' && ! orchestratorMsgCount,
				onClick: handleNewChat,
			},
			shouldUseUnifiedAgent && {
				icon: lifesaver,
				title: __( 'New Zendesk chat', '__i18n_text_domain__' ),
				isDisabled: pathname === '/zendesk' && ! zendeskMsgCount,
				onClick: () => {
					handleAbort();
					navigate( '/zendesk' );
				},
			},
			isDocked && {
				icon: login,
				title: __( 'Pop out sidebar', '__i18n_text_domain__' ),
				onClick: () => {
					undock();
					setIsDocked( false );
				},
			},
			! isDocked &&
				canDock && {
					icon: drawerRight,
					title: __( 'Move to sidebar', '__i18n_text_domain__' ),
					onClick: () => {
						dock();
						setIsDocked( true );
					},
				},
		].filter( Boolean ) as ChatHeaderOptions;
	};

	const chatHeaderOptions = getChatHeaderOptions();

	const OrchestratorChatRoute = (
		<OrchestratorChat
			emptyViewSuggestions={ emptyViewSuggestions }
			isDocked={ isDocked }
			isOpen={ isPersistedOpen }
			onClose={ handleClose }
			onExpand={ handleExpand }
			chatHeaderOptions={ chatHeaderOptions }
			markdownComponents={ markdownComponents }
			markdownExtensions={ markdownExtensions }
			isCompactMode={ isCompactMode }
			useNavigationContinuation={ useNavigationContinuation }
			useAbilitiesSetup={ useAbilitiesSetup }
			useSuggestions={ useSuggestions }
			getChatComponent={ getChatComponent }
			siteBuildUtils={ siteBuildUtils }
			navigate={ navigate }
			useImageUpload={ useImageUpload }
			onMessagesCountChange={ setOrchestratorMsgCount }
		/>
	);

	const ZendeskChatRoute = (
		<ZendeskChat
			isDocked={ isDocked }
			isOpen={ isPersistedOpen }
			onClose={ handleClose }
			onExpand={ handleExpand }
			chatHeaderOptions={ chatHeaderOptions }
			markdownComponents={ markdownComponents }
			markdownExtensions={ markdownExtensions }
			onMessagesCountChange={ setZendeskMsgCount }
		/>
	);

	const HistoryRoute = (
		<AgentHistory
			chatHeaderOptions={ chatHeaderOptions }
			isDocked={ isDocked }
			isOpen={ isPersistedOpen }
			onAbort={ handleAbort }
			onClose={ handleClose }
			onExpand={ handleExpand }
			onSelectConversation={ handleSelectConversation }
			onNewChat={ handleNewChat }
		/>
	);

	const SupportGuideRoute = (
		<SupportGuide
			isEligibleForChat={ isEligibleForChat }
			onAbort={ handleAbort }
			onClose={ closeSidebar }
			isDocked={ isDocked }
			isOpen={ isPersistedOpen }
			sectionName={ sectionName }
			currentSiteDomain={ site?.domain }
			chatHeaderOptions={ chatHeaderOptions }
		/>
	);

	const SupportGuidesRoute = (
		<SupportGuides
			onAbort={ handleAbort }
			onClose={ closeSidebar }
			isDocked={ isDocked }
			isOpen={ isPersistedOpen }
			chatHeaderOptions={ chatHeaderOptions }
		/>
	);

	return (
		shouldRenderChat &&
		createAgentPortal(
			// NOTE: Use route state to pass data that needs to be accessed throughout the app.
			<Routes>
				<Route path="/chat" element={ OrchestratorChatRoute } />
				<Route path="/post" element={ SupportGuideRoute } />
				<Route path="/zendesk" element={ ZendeskChatRoute } />
				<Route path="/support-guides" element={ SupportGuidesRoute } />
				<Route path="/history" element={ HistoryRoute } />
				<Route path="*" element={ <Navigate to="/chat" state={ { isNewChat: true } } replace /> } />
			</Routes>
		)
	);
}
