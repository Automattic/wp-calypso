import { getAgentManager } from '@automattic/agenttic-client';
import {
	AgentsManagerSelect,
	type AgentsManagerSite,
	type CurrentUser,
} from '@automattic/data-stores';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useSelect } from '@wordpress/data';
import { useEffect, useRef } from '@wordpress/element';
import { useLocation, useNavigate } from 'react-router-dom';
import { ORCHESTRATOR_AGENT_ID } from '../constants';
import { AgentsManagerContextProvider, useAgentsManagerContext } from '../contexts';
import { useAgentConfig } from '../hooks/use-agent-config';
import { useEmptyViewSuggestions } from '../hooks/use-empty-view-suggestions';
import useHasAiChatEntryButton from '../hooks/use-has-ai-chat-entry-button';
import { useOpenChatUrlParam } from '../hooks/use-open-chat-url-param';
import { useSessionHandoffLinks } from '../hooks/use-session-handoff-links';
import { useUrlSessionHandoff } from '../hooks/use-url-session-handoff';
import useWebMcpTools from '../hooks/use-webmcp-tools';
import { AGENTS_MANAGER_STORE } from '../stores';
import {
	clearSessionId,
	getOrCreateSessionId,
	getSessionId,
	NO_SITE,
	saveSessionId,
} from '../utils/agent-session';
import { createAgentConfig } from '../utils/create-agent-config';
import { isReaderChatAgent } from '../utils/is-reader-chat-agent';
import { loadExternalProviders, type LoadedProviders } from '../utils/load-external-providers';
import { isHandoffAgent, type SessionHandoff } from '../utils/session-handoff';
import { canExposeWebMcpTools } from '../webmcp/eligibility';
import { WebMcpProviderAbilitiesSetup } from '../webmcp/provider-abilities-setup';
import AgentDock from './agent-dock';
import { PersistentRouter } from './persistent-router';
import type { JSX } from 'react';

export interface AgentsManagerProps {
	/** The name of the current section (e.g., 'wp-admin', 'gutenberg'). */
	sectionName: string;
	/** The current user object. */
	currentUser?: CurrentUser;
	/** The selected site object. */
	site?: AgentsManagerSite | null;
	/** The current route path. */
	currentRoute?: string;
	/** The ID of the currently selected site, or undefined for non-site contexts. */
	currentSiteId?: number;
	/** Explicit agent ID supplied by the host. */
	agentId?: string;
	/** Whether this screen is currently enabled only for internal users. */
	isInternalOnly?: boolean;
	/** Whether the host's masterbar renders the AI chat button, even before it's in the DOM. */
	hasMasterbarAiChatButton?: boolean;
	/** Zendesk conversation tags to apply when a new support conversation is created. */
	zendeskConversationTags?: string[];
	/** Index selecting a dedicated Smooch integration for new support conversations. */
	zendeskSmoochIntegrationKey?: string;
	/** Zendesk Product ticket-field value to apply to new support conversations. */
	zendeskTicketProductFieldValue?: string;
}

const queryClient = new QueryClient();

// A stable default, so it doesn't retrigger conversation effects on every render.
const EMPTY_ARRAY: string[] = [];

// The scope the live agent was initialized for. Module-level, like the agent
// manager, so a remount on a different scope (Calypso remounts on some routes)
// still discards the old agent.
let lastInitializedScope: string | undefined;

export default function AgentsManager( {
	sectionName,
	currentUser,
	site,
	currentRoute,
	currentSiteId,
	agentId,
	isInternalOnly = false,
	hasMasterbarAiChatButton = false,
	zendeskConversationTags = EMPTY_ARRAY,
	zendeskSmoochIntegrationKey,
	zendeskTicketProductFieldValue,
}: AgentsManagerProps ): JSX.Element | null {
	const urlSessionHandoff = useUrlSessionHandoff();

	// Wait for the store to load so persisted UI state (open/docked/minimized)
	// is restored before the dock first renders.
	const { hasLoaded: isStoreReady } = useSelect( ( select ) => {
		const store: AgentsManagerSelect = select( AGENTS_MANAGER_STORE );
		return store.getAgentsManagerState();
	}, [] );

	// `?ai-open=true` must be applied to the store before `AgentDock` mounts, so
	// the chat first-renders already open in both docked and undocked modes.
	const isOpenParamHandled = useOpenChatUrlParam();

	if ( ! isStoreReady || ! isOpenParamHandled ) {
		return null;
	}

	const siteKey = currentSiteId ? String( currentSiteId ) : NO_SITE;

	return (
		<QueryClientProvider client={ queryClient }>
			<PersistentRouter siteKey={ siteKey }>
				<AgentsManagerContextProvider
					value={ {
						sectionName,
						currentUser,
						site,
						siteKey,
						currentRoute,
						isInternalOnly,
						hasMasterbarAiChatButton,
						zendeskConversationTags,
						zendeskSmoochIntegrationKey,
						zendeskTicketProductFieldValue,
					} }
				>
					<AgentSetup agentId={ agentId } urlSessionHandoff={ urlSessionHandoff } />
				</AgentsManagerContextProvider>
			</PersistentRouter>
		</QueryClientProvider>
	);
}

/**
 * Returns the tab's stored session to resume (conversation switches save it
 * before navigating here), or '' for a new chat.
 * Reader chat and the orchestrator pre-generate one, so a page change before
 * the first reply still finds it; other agents get theirs from the server via
 * `onSessionIdChange`.
 */
function resolveTabSessionId(
	isNewChat: boolean,
	agentId: string | undefined,
	siteKey: string,
	userId?: number
): string {
	if ( isNewChat ) {
		return '';
	}
	if ( isReaderChatAgent( agentId ) || agentId === ORCHESTRATOR_AGENT_ID ) {
		return getOrCreateSessionId( agentId, siteKey, userId );
	}
	return getSessionId( agentId, siteKey, userId );
}

// Split out so its hooks run inside the router and context providers `AgentsManager` renders.
function AgentSetup( {
	agentId: hostAgentId,
	urlSessionHandoff,
}: {
	agentId?: string;
	urlSessionHandoff: SessionHandoff | null;
} ): JSX.Element | null {
	const { site, siteKey, currentUser, sectionName, currentRoute, agentConfig, setAgentConfig } =
		useAgentsManagerContext();
	const userId = currentUser?.ID;

	const loadedProvidersRef = useRef< LoadedProviders | null >( null );
	// Lets the effect read the latest config without depending on the config it sets.
	const agentConfigRef = useRef( agentConfig );
	agentConfigRef.current = agentConfig;
	const wasChatViewShowingRef = useRef( false );

	const navigate = useNavigate();
	const { pathname, state: locationState } = useLocation();
	const isNewChat = pathname.startsWith( '/chat' ) && !! locationState?.isNewChat;

	// Mirrors `AgentDock`'s visibility: with an AI entry button the chat
	// unmounts on close, so closing must count as leaving the chat view.
	const { isOpen } = useSelect( ( select ) => {
		const store: AgentsManagerSelect = select( AGENTS_MANAGER_STORE );
		return store.getAgentsManagerState();
	}, [] );
	const hasAiChatEntry = useHasAiChatEntryButton();
	const isChatVisible = !! isOpen || ! hasAiChatEntry;

	// Where the conversation view (and its `useConversation` fetch) is mounted;
	// '/' only exists transiently before the catch-all redirects to the chat.
	const isChatViewShowing = ( pathname.startsWith( '/chat' ) || pathname === '/' ) && isChatVisible;

	// `?agent=` and `?version=` come from the browser URL: `PersistentRouter` is a
	// memory router.
	const { agentId, version } = useAgentConfig( hostAgentId );

	useSessionHandoffLinks( agentId );

	// A handed-off session is stored under its own site scope and resumed only
	// when this page is in that scope, as a site switch within one origin would.
	const handoff = urlSessionHandoff && isHandoffAgent( agentId ) ? urlSessionHandoff : null;
	const handoffSiteKey = handoff?.siteKey ?? siteKey;
	const initialSessionId = handoff && handoffSiteKey === siteKey ? handoff.sessionId : '';

	// The handoff seeds only the first initialization; the effect saves it, so the
	// tab's stored session applies after that.
	let sessionId: string;
	if ( initialSessionId && ! agentConfig ) {
		sessionId = initialSessionId;
	} else {
		sessionId = resolveTabSessionId( isNewChat, agentId, siteKey, userId );
	}

	useWebMcpTools( {
		toolProvider: loadedProvidersRef.current?.toolProvider,
		scope: `${ siteKey }:${ currentRoute ?? '' }:${ window.location.pathname }${
			window.location.search
		}`,
	} );

	useEffect( () => {
		if ( ! agentConfigRef.current && handoff ) {
			saveSessionId( handoff.sessionId, agentId, handoffSiteKey, userId );
		}

		// A dep change supersedes this run mid-await — a stale initialization
		// must not navigate or publish its config over the newer run's.
		let isSuperseded = false;

		const isReturningToChatView = isChatViewShowing && ! wasChatViewShowingRef.current;
		wasChatViewShowingRef.current = isChatViewShowing;

		async function discardAgent(): Promise< void > {
			const agentManager = getAgentManager();

			if ( agentManager.hasAgent( agentId ) ) {
				await agentManager.abortCurrentRequest( agentId );
				agentManager.removeAgent( agentId );
			}
		}

		async function initializeAgent(): Promise< void > {
			// On a scope switch (`siteKey` plus the user, which key the tab's
			// storage), drop the previous scope's agent so its still-streaming
			// reply can't write into this scope's session or transcript.
			const scope = `${ siteKey }-${ userId ?? '' }`;
			const previousScope = lastInitializedScope;
			lastInitializedScope = scope;

			if ( previousScope !== undefined && previousScope !== scope ) {
				await discardAgent();

				if ( isSuperseded ) {
					return;
				}
			}

			if ( isNewChat ) {
				await discardAgent();

				if ( isSuperseded ) {
					return;
				}

				clearSessionId( agentId, siteKey, userId );
				// Clear route state to prevent repeated new chat initialization
				navigate( '/chat', { replace: true } );
				return;
			}

			const currentConfig = agentConfigRef.current;
			const isSameAgent = currentConfig?.agentId === agentId;
			// A live agent is required to skip: after a teardown the config can
			// still match while the agent is gone, and only a fresh config makes
			// `useAgentChat` recreate it.
			const hasLiveAgent = getAgentManager().hasAgent( agentId );

			// Already aligned with this tab's session — nothing to initialize.
			if ( isSameAgent && currentConfig?.sessionId === sessionId && hasLiveAgent ) {
				return;
			}

			// Keep the running conversation while the chat view stays shown: only
			// the agent's own `onSessionIdChange` writes a session then (user-driven
			// switches navigate first), and re-initializing would refetch and
			// clobber the live transcript. The stored session applies on the next
			// navigation, away or back to here.
			if ( isSameAgent && isChatViewShowing && ! isReturningToChatView && hasLiveAgent ) {
				return;
			}

			let providers = loadedProvidersRef.current;
			if ( ! providers ) {
				providers = await loadExternalProviders();
				loadedProvidersRef.current = providers;

				if ( isSuperseded ) {
					return;
				}
			}

			const siteId = typeof site?.ID === 'number' ? site.ID : undefined;

			const config = await createAgentConfig( {
				sessionId,
				sessionSiteKey: siteKey,
				sessionUserId: userId,
				siteId,
				currentRoute,
				toolProvider: providers.toolProvider,
				contextProvider: providers.contextProvider,
				providerIds: providers.providerIds,
				interactiveUiCatalogs: providers.interactiveUiCatalogs,
				environment: sectionName || 'calypso',
				agentId,
				version,
				onTaskUpdate: providers.onTaskUpdate,
			} );

			if ( isSuperseded ) {
				return;
			}

			setAgentConfig( config );
		}

		initializeAgent();

		return () => {
			isSuperseded = true;
		};
	}, [
		agentId,
		currentRoute,
		isChatViewShowing,
		isNewChat,
		handoff,
		handoffSiteKey,
		navigate,
		sessionId,
		sectionName,
		setAgentConfig,
		site?.ID,
		siteKey,
		userId,
		version,
	] );

	const loadedProviders = loadedProvidersRef.current;
	const emptyViewSuggestions = useEmptyViewSuggestions( { loadedProviders } );

	if ( ! agentConfig || ! loadedProviders || emptyViewSuggestions === null ) {
		return null;
	}

	return (
		<>
			{ loadedProviders.useAbilitiesSetup && canExposeWebMcpTools() && (
				<WebMcpProviderAbilitiesSetup
					useProviderAbilitiesSetup={ loadedProviders.useAbilitiesSetup }
				/>
			) }
			<AgentDock
				emptyViewSuggestions={ emptyViewSuggestions }
				markdownComponents={ loadedProviders.markdownComponents || {} }
				markdownExtensions={ loadedProviders.markdownExtensions || {} }
				useProviderAbilitiesSetup={ loadedProviders.useAbilitiesSetup }
				useSuggestions={ loadedProviders.useSuggestions }
				getChatComponent={ loadedProviders.getChatComponent }
				interactiveUiCatalogs={ loadedProviders.interactiveUiCatalogs }
				siteBuildUtils={ loadedProviders.siteBuildUtils }
				transformMessages={ loadedProviders.transformMessages }
				useCheckpoint={ loadedProviders.useCheckpoint }
				capabilities={ loadedProviders.capabilities }
			/>
		</>
	);
}
