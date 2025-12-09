import {
	getAgentManager,
	useAgentChat,
	type UseAgentChatConfig,
	type AuthProvider,
	type Ability as AgenticAbility,
} from '@automattic/agenttic-client';
import { type Suggestion } from '@automattic/agenttic-ui';
import { useDispatch, useSelect } from '@wordpress/data';
import { useEffect, useState } from '@wordpress/element';
import { useParams, useNavigate } from 'react-router-dom';
import { ORCHESTRATOR_AGENT_ID, ORCHESTRATOR_AGENT_URL } from '../../constants';
import useConversation from '../../hooks/use-conversation';
import { AGENTS_MANAGER_STORE } from '../../stores';
import { getSessionId, SESSION_STORAGE_KEY } from '../../utils/agent-session';
import { type LoadedProviders } from '../../utils/load-external-providers';
import AgentChat from '../agent-chat';
import { type Options as ChatHeaderOptions } from '../chat-header';
import type { ContextEntry } from '../../extension-types';
import type { AgentsManagerSelect } from '@automattic/data-stores';

/**
 * Resolve context entries by calling `getData()` closures
 *
 * Takes context entries with optional `getData()` closures and resolves them
 * by calling `getData()` to populate the `data` field. The `getData` function is
 * removed from the resolved entries.
 *
 * This allows us to fetch live data as needed.
 */
function resolveContextEntries( entries: ContextEntry[] ): ContextEntry[] {
	return entries.map( ( entry ) => {
		if ( entry.getData ) {
			try {
				const data = entry.getData();
				// Remove getData and add resolved data
				const { getData: _, ...resolvedEntry } = entry;
				return {
					...resolvedEntry,
					data,
				};
			} catch ( error ) {
				// eslint-disable-next-line no-console
				console.warn(
					`[OrchestratorAgentChat] Failed to resolve context entry "${ entry.id }":`,
					error
				);
				// Return entry without data if resolution fails
				const { getData: _, ...entryWithoutGetData } = entry;
				return entryWithoutGetData;
			}
		}
		// Entry already has data or doesn't need resolution
		return entry;
	} );
}

interface OrchestratorAgentChatProps {
	/** Authentication provider for the chat client. */
	authProvider: AuthProvider;
	/** The current route path. */
	currentRoute?: string;
	/** Indicates if the chat is docked in the sidebar. */
	isDocked: boolean;
	/** Function to close the sidebar. */
	closeSidebar: () => void;
	/** Chat header menu options. */
	chatHeaderOptions: ChatHeaderOptions;
	/** Suggestions displayed when the chat is empty. */
	defaultSuggestions?: Suggestion[];
	/** Loaded external providers. */
	loadedProviders: LoadedProviders;
}

export default function OrchestratorAgentChat( {
	authProvider,
	currentRoute,
	isDocked,
	closeSidebar,
	chatHeaderOptions,
	defaultSuggestions = [],
	loadedProviders,
}: OrchestratorAgentChatProps ) {
	const navigate = useNavigate();
	const { sessionId = '' } = useParams< { sessionId?: string } >();
	const { useNavigationContinuation } = loadedProviders;
	const agentId = ORCHESTRATOR_AGENT_ID;
	const localStorageSessionId = getSessionId();

	const { setIsOpen } = useDispatch( AGENTS_MANAGER_STORE );
	const { hasLoaded: isStoreReady, isOpen = false } = useSelect( ( select ) => {
		const store: AgentsManagerSelect = select( AGENTS_MANAGER_STORE );
		return store.getAgentsManagerState();
	}, [] );

	// Create a minimal default config immediately so hooks can always be called
	const [ agentConfig, setAgentConfig ] = useState< UseAgentChatConfig >( () => ( {
		agentId,
		agentUrl: ORCHESTRATOR_AGENT_URL,
		sessionId,
		sessionIdStorageKey: SESSION_STORAGE_KEY,
		authProvider,
		enableStreaming: true,
		contextProvider: {
			getClientContext: () => ( {
				url: window.location.href,
				pathname: currentRoute || window.location.pathname,
				search: window.location.search,
				environment: 'calypso',
			} ),
		},
	} ) );

	const {
		messages,
		suggestions,
		isProcessing,
		error,
		loadMessages,
		onSubmit,
		abortCurrentRequest,
	} = useAgentChat( agentConfig );

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
				navigate( `/chat/${ serverSessionId }`, { replace: true } );
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

	useEffect( () => {
		const initializeAgent = () => {
			const { toolProvider, contextProvider } = loadedProviders;

			// Create the agent configuration
			const config: UseAgentChatConfig = {
				agentId,
				agentUrl: ORCHESTRATOR_AGENT_URL,
				sessionId,
				sessionIdStorageKey: SESSION_STORAGE_KEY,
				authProvider,
				enableStreaming: true,
			};

			// Add tool provider if provided by plugin
			if ( toolProvider ) {
				// Wrap `toolProvider` to filter out `null` annotation values
				// WordPress Abilities API uses `null`, but `agenttic-client` expects `undefined`
				config.toolProvider = {
					...toolProvider,
					getAbilities: async (): Promise< AgenticAbility[] > => {
						const abilities = await toolProvider.getAbilities();
						return abilities.map( ( ability ) => ( {
							...ability,
							meta: ability.meta?.annotations
								? {
										...ability.meta,
										annotations: Object.fromEntries(
											Object.entries( ability.meta.annotations ).filter(
												( [ , value ] ) => value !== null
											)
										),
								  }
								: ability.meta,
						} ) ) as AgenticAbility[];
					},
				};
			}

			// Add context provider - use plugin's or create default Calypso context
			if ( contextProvider ) {
				// Wrap plugin's context provider to resolve contextEntries
				config.contextProvider = {
					getClientContext: () => {
						const pluginContext = contextProvider.getClientContext();

						// Resolve `contextEntries` if present
						if ( pluginContext.contextEntries && pluginContext.contextEntries.length ) {
							return {
								...pluginContext,
								contextEntries: resolveContextEntries( pluginContext.contextEntries ),
							};
						}

						return pluginContext;
					},
				};
			} else {
				// Create default Calypso context
				config.contextProvider = {
					getClientContext: () => ( {
						url: window.location.href,
						pathname: currentRoute || window.location.pathname,
						search: window.location.search,
						environment: 'calypso',
					} ),
				};
			}

			setAgentConfig( config );
		};

		initializeAgent();
	}, [ agentId, authProvider, currentRoute, loadedProviders, sessionId ] );

	useEffect( () => {
		// This should mean the user was in a new chat and received messages from the server
		// Move the user to the correct chat URL
		// Know issue: Because the received messages are not in the ReactQuery cache,
		// We are triggering a reload after moving to the correct URL.
		// We could try setting the ReactQuery cache before navigating to avoid that.
		if ( sessionId === '' && localStorageSessionId && messages.length ) {
			navigate( `/chat/${ localStorageSessionId }`, { replace: true } );
		}
	}, [ localStorageSessionId, messages.length, navigate, sessionId ] );

	if ( ! isStoreReady ) {
		return null;
	}

	return (
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
			chatHeaderOptions={ chatHeaderOptions }
			markdownComponents={ loadedProviders.markdownComponents }
			markdownExtensions={ loadedProviders.markdownExtensions }
			emptyViewSuggestions={ loadedProviders.suggestions || defaultSuggestions }
		/>
	);
}
