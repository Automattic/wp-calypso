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
import { useOpenChatUrlParam } from '../hooks/use-open-chat-url-param';
import { AGENTS_MANAGER_STORE } from '../stores';
import { clearSessionId, getOrCreateSessionId, getSessionId } from '../utils/agent-session';
import { clearAnnouncedSessionId, getAnnouncedSessionId } from '../utils/announced-sessions';
import { createAgentConfig } from '../utils/create-agent-config';
import { isReaderChatAgent } from '../utils/is-reader-chat-agent';
import { loadExternalProviders, type LoadedProviders } from '../utils/load-external-providers';
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
 * other agents get theirs from the server (`onSessionIdChange`, plus the
 * chat's canonical-ID sync).
 * Empty means a new chat.
 */
function resolveTabSessionId( isNewChat: boolean, agentId?: string ): string {
	if ( isNewChat ) {
		return '';
	}
	if ( isReaderChatAgent( agentId ) ) {
		return getOrCreateSessionId( agentId );
	}
	return getSessionId( agentId );
}

// Separate component that uses hooks within `PersistentRouter` context
function AgentSetup( { agentId: hostAgentId }: { agentId?: string } ): JSX.Element | null {
	const { site, sectionName, currentRoute, agentConfig, setAgentConfig } =
		useAgentsManagerContext();
	const loadedProvidersRef = useRef< LoadedProviders | null >( null );
	const agentConfigRef = useRef( agentConfig );
	agentConfigRef.current = agentConfig;
	const previousSiteIdRef = useRef( site?.ID );
	const navigate = useNavigate();
	const { pathname, state } = useLocation();

	// Detect new chat requests via `state.isNewChat` on the `/chat` route.
	const isNewChat = pathname.startsWith( '/chat' ) && !! state?.isNewChat;

	// Read agent/version overrides from browser URL (?agent=, ?version=).
	// PersistentRouter (memory router) does not track window.location.search.
	const { agentId, version, isLoading: isAgentConfigLoading } = useAgentConfig( hostAgentId );

	const sessionId = resolveTabSessionId( isNewChat, agentId );

	useEffect( () => {
		// Wait for the agent config to stabilize before initializing.
		if ( isAgentConfigLoading ) {
			return;
		}

		// A dep change supersedes this run mid-await — a stale initialization
		// must not navigate or publish its config over the newer run's.
		let isSuperseded = false;

		// Abort the agent's in-flight request, remove it, and forget its
		// announced session.
		async function discardAgent(): Promise< void > {
			const agentManager = getAgentManager();

			if ( agentManager.hasAgent( agentId ) ) {
				await agentManager.abortCurrentRequest( agentId );
				agentManager.removeAgent( agentId );
			}

			clearAnnouncedSessionId( agentId );
		}

		async function initializeAgent(): Promise< void > {
			// A site switch is a context switch: drop the previous site's agent
			// so its still-streaming response can't write into this site's
			// session or transcript, then initialize from this site's session.
			if ( previousSiteIdRef.current !== site?.ID ) {
				previousSiteIdRef.current = site?.ID;
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

				clearSessionId( agentId );
				// Clear route state to prevent repeated new chat initialization
				navigate( '/chat', { replace: true } );
				return;
			}

			// The tab session catching up to the session the live agent already
			// announced is not a conversation switch — re-initializing would
			// make `useConversation` refetch and clobber the running chat.
			if (
				agentConfigRef.current?.agentId === agentId &&
				sessionId &&
				sessionId === getAnnouncedSessionId( agentId )
			) {
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
		isNewChat,
		navigate,
		sessionId,
		sectionName,
		setAgentConfig,
		site?.ID,
		hostAgentId,
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
		<AgentDock
			emptyViewSuggestions={ emptyViewSuggestions }
			markdownComponents={ loadedProviders.markdownComponents || {} }
			markdownExtensions={ loadedProviders.markdownExtensions || {} }
			useNavigationContinuation={ loadedProviders.useNavigationContinuation }
			useProviderAbilitiesSetup={ loadedProviders.useAbilitiesSetup }
			useSuggestions={ loadedProviders.useSuggestions }
			getChatComponent={ loadedProviders.getChatComponent }
			siteBuildUtils={ loadedProviders.siteBuildUtils }
			transformMessages={ loadedProviders.transformMessages }
			useCheckpoint={ loadedProviders.useCheckpoint }
			capabilities={ loadedProviders.capabilities }
		/>
	);
}
