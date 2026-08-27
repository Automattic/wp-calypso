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
import { AgentsManagerContextProvider, useAgentsManagerContext } from '../contexts';
import { useAgentConfig } from '../hooks/use-agent-config';
import { useEmptyViewSuggestions } from '../hooks/use-empty-view-suggestions';
import useHasAiChatEntryButton from '../hooks/use-has-ai-chat-entry-button';
import { useOpenChatUrlParam } from '../hooks/use-open-chat-url-param';
import useWebMcpTools from '../hooks/use-webmcp-tools';
import { AGENTS_MANAGER_STORE } from '../stores';
import { clearSessionId, getOrCreateSessionId, getSessionId } from '../utils/agent-session';
import { createAgentConfig } from '../utils/create-agent-config';
import { isReaderChatAgent } from '../utils/is-reader-chat-agent';
import {
	loadExternalProviders,
	type AbilitiesSetupHook,
	type LoadedProviders,
} from '../utils/load-external-providers';
import { canExposeWebMcpTools } from '../webmcp/eligibility';
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
	/** Explicit agent ID for hosts that must not fall back to Unified Chat. */
	agentId?: string;
	/** Zendesk conversation tags to apply when a new support conversation is created. */
	zendeskConversationTags?: string[];
	/** Index selecting a dedicated Smooch integration for new support conversations. */
	zendeskSmoochIntegrationKey?: string;
	/** Zendesk Product ticket-field value to apply to new support conversations. */
	zendeskTicketProductFieldValue?: string;
}

const queryClient = new QueryClient();

// Stable empty-array reference so the default prop doesn't change identity on
// every render and retrigger downstream conversation effects.
const EMPTY_ARRAY: string[] = [];

// The scope the live agent was initialized for. Module-level like the agent
// manager itself, so a host that unmounts and remounts this tree (Calypso does
// on some routes) still discards when the remount lands on a different scope.
let lastInitializedScope: string | undefined;

// External editor abilities currently register from a chat-owned hook. These
// inert chat actions let that hook mount for WebMCP without starting a chat run.
const WEBMCP_PROVIDER_SETUP_ACTIONS = {
	addMessage: () => {},
	clearMessages: () => {},
	clearSuggestions: () => {},
	getAgentManager,
	isProcessing: false,
	setIsThinking: () => {},
	deleteMarkedMessages: () => {},
	getSessionId: () => undefined,
	setIsBuildingSite: () => {},
	setThinkingMessage: () => {},
} satisfies Parameters< AbilitiesSetupHook >[ 0 ];

function WebMcpProviderAbilitiesSetup( {
	useProviderAbilitiesSetup,
}: {
	useProviderAbilitiesSetup: AbilitiesSetupHook;
} ): null {
	useProviderAbilitiesSetup( WEBMCP_PROVIDER_SETUP_ACTIONS );
	return null;
}

export default function AgentsManager( {
	sectionName,
	currentUser,
	site,
	currentRoute,
	currentSiteId,
	agentId,
	zendeskConversationTags = EMPTY_ARRAY,
	zendeskSmoochIntegrationKey,
	zendeskTicketProductFieldValue,
}: AgentsManagerProps ): JSX.Element | null {
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

	const siteKey = currentSiteId ? String( currentSiteId ) : 'no-site';

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
						zendeskConversationTags,
						zendeskSmoochIntegrationKey,
						zendeskTicketProductFieldValue,
					} }
				>
					<AgentSetup agentId={ agentId } />
				</AgentsManagerContextProvider>
			</PersistentRouter>
		</QueryClientProvider>
	);
}

/**
 * Resolve the session to resume from this tab's stored session — the single
 * source of truth; conversation switches save it before navigating here.
 * Reader chat pre-generates one (blog frontends reload on every navigation);
 * other agents get theirs from the server via `onSessionIdChange`.
 * Empty means a new chat.
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
	if ( isReaderChatAgent( agentId ) ) {
		return getOrCreateSessionId( agentId, siteKey, userId );
	}
	return getSessionId( agentId, siteKey, userId );
}

// Separate component that uses hooks within `PersistentRouter` context
function AgentSetup( { agentId: hostAgentId }: { agentId?: string } ): JSX.Element | null {
	const { site, siteKey, currentUser, sectionName, currentRoute, agentConfig, setAgentConfig } =
		useAgentsManagerContext();
	const userId = currentUser?.ID;
	const loadedProvidersRef = useRef< LoadedProviders | null >( null );
	const agentConfigRef = useRef( agentConfig );
	agentConfigRef.current = agentConfig;
	const wasChatViewShowingRef = useRef( false );
	const navigate = useNavigate();
	const { pathname, state } = useLocation();

	// Detect new chat requests via `state.isNewChat` on the `/chat` route.
	const isNewChat = pathname.startsWith( '/chat' ) && !! state?.isNewChat;

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

	// Read agent/version overrides from browser URL (?agent=, ?version=).
	// PersistentRouter (memory router) does not track window.location.search.
	const { agentId, version, isLoading: isAgentConfigLoading } = useAgentConfig( hostAgentId );

	const sessionId = resolveTabSessionId( isNewChat, agentId, siteKey, userId );

	useWebMcpTools( {
		toolProvider: loadedProvidersRef.current?.toolProvider,
		scope: `${ siteKey }:${ currentRoute ?? '' }:${ window.location.pathname }${
			window.location.search
		}`,
	} );

	useEffect( () => {
		// Wait for the agent config to stabilize before initializing.
		if ( isAgentConfigLoading ) {
			return;
		}

		// A dep change supersedes this run mid-await — a stale initialization
		// must not navigate or publish its config over the newer run's.
		let isSuperseded = false;

		const isReturningToChatView = isChatViewShowing && ! wasChatViewShowingRef.current;
		wasChatViewShowingRef.current = isChatViewShowing;

		// Abort the agent's in-flight request and remove it.
		async function discardAgent(): Promise< void > {
			const agentManager = getAgentManager();

			if ( agentManager.hasAgent( agentId ) ) {
				await agentManager.abortCurrentRequest( agentId );
				agentManager.removeAgent( agentId );
			}
		}

		async function initializeAgent(): Promise< void > {
			// A session-scope switch (`siteKey` and the user, which together key
			// the tab's storage) is a context switch: drop the previous scope's
			// agent so its still-streaming response can't write into this scope's
			// session or transcript, then initialize from this scope's session.
			const scope = `${ siteKey }-${ userId ?? '' }`;
			const previousScope = lastInitializedScope;
			lastInitializedScope = scope;

			if ( previousScope !== undefined && previousScope !== scope ) {
				await discardAgent();

				if ( isSuperseded ) {
					return;
				}
			}

			// Handle new chat: clear existing session and navigate to clean state
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

			// The running conversation wins while the chat view stays shown: the
			// only thing that writes a session in that window is the agent's own
			// `onSessionIdChange` (every user-driven switch navigates first), and
			// re-initializing would refetch and clobber the live transcript.
			// Storage is honored on the next navigation — away, or back to here.
			if ( isSameAgent && isChatViewShowing && ! isReturningToChatView && hasLiveAgent ) {
				return;
			}

			// Load external providers (only once)
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
		isAgentConfigLoading,
		isChatViewShowing,
		isNewChat,
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

	// Load empty view suggestions (handles Big Sky's theme-dependent suggestions)
	const emptyViewSuggestions = useEmptyViewSuggestions( { loadedProviders } );

	// Don't render until the setup is complete AND suggestions are ready
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
				siteBuildUtils={ loadedProviders.siteBuildUtils }
				transformMessages={ loadedProviders.transformMessages }
				useCheckpoint={ loadedProviders.useCheckpoint }
				capabilities={ loadedProviders.capabilities }
			/>
		</>
	);
}
