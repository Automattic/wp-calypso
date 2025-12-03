/**
 * Unified AI Agent Component
 *
 * Configures the AI agent, manages sessions, and integrates custom tools and context.
 */

import { createOdieBotId, getAgentManager } from '@automattic/agenttic-client';
import { useMemo, useEffect, useState } from '@wordpress/element';
import { useLocation } from 'react-router-dom';
import { createCalypsoAuthProvider } from '../../auth/calypso-auth-provider';
import { ORCHESTRATOR_AGENT_ID, ORCHESTRATOR_AGENT_URL } from '../../constants';
import { SESSION_STORAGE_KEY, getSessionId } from '../../utils/agent-session';
import { lastConversationCache } from '../../utils/conversation-cache';
import AgentDock from '../agent-dock';
import { PersistentRouter } from '../persistent-router';
import type { ToolProvider, ContextProvider, ContextEntry } from '../../extension-types';
import type { UseAgentChatConfig, Ability as AgenticAbility } from '@automattic/agenttic-client';
import type { MarkdownComponents, MarkdownExtensions, Suggestion } from '@automattic/agenttic-ui';
import type { HelpCenterSite, CurrentUser } from '@automattic/data-stores';

export interface UnifiedAIAgentProps {
	/** The current route path. */
	currentRoute?: string;
	/** The name of the current section (e.g., 'posts', 'pages'). */
	sectionName?: string;
	/** The selected site object. */
	site?: HelpCenterSite | null;
	/** The current user object. */
	currentUser?: CurrentUser;
	/** Called when the agent is closed. */
	handleClose?: () => void;
	/** Tool provider for custom abilities. */
	toolProvider?: ToolProvider;
	/** Context provider for environment-specific context. */
	contextProvider?: ContextProvider;
	/** Suggestions displayed when the chat is empty. */
	emptyViewSuggestions?: Suggestion[];
	/** Custom components for rendering markdown. */
	markdownComponents?: MarkdownComponents;
	/** Custom markdown extensions. */
	markdownExtensions?: MarkdownExtensions;
}

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
				console.warn( `[UnifiedAIAgent] Failed to resolve context entry "${ entry.id }":`, error );
				// Return entry without data if resolution fails
				const { getData: _, ...entryWithoutGetData } = entry;
				return entryWithoutGetData;
			}
		}
		// Entry already has data or doesn't need resolution
		return entry;
	} );
}

export default function UnifiedAIAgent( props: UnifiedAIAgentProps ) {
	return (
		<PersistentRouter>
			<AgentSetup { ...props } />
		</PersistentRouter>
	);
}

// Separate component that uses hooks within `PersistentRouter` context
function AgentSetup( {
	currentRoute,
	site = null,
	toolProvider,
	contextProvider,
	emptyViewSuggestions: customSuggestions,
	markdownComponents = {},
	markdownExtensions = {},
}: UnifiedAIAgentProps ) {
	const [ agentConfig, setAgentConfig ] = useState< UseAgentChatConfig | null >( null );
	const { state } = useLocation();
	// Use persisted route state `sessionId` if available, otherwise fall back to stored `sessionId`
	const sessionId = state?.sessionId || getSessionId();

	// Create the initial agent configuration
	const config = useMemo< UseAgentChatConfig >(
		() => {
			const config: UseAgentChatConfig = {
				agentId: ORCHESTRATOR_AGENT_ID,
				agentUrl: ORCHESTRATOR_AGENT_URL,
				sessionId,
				sessionIdStorageKey: SESSION_STORAGE_KEY,
				authProvider: createCalypsoAuthProvider( site?.ID ),
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

			return config;
		},
		// eslint-disable-next-line react-hooks/exhaustive-deps -- Only create once
		[]
	);

	// Load config AND pre-load cached messages for progressive loading
	useEffect( () => {
		const initializeWithCache = async () => {
			// Check if we have cached messages to pre-load
			if ( sessionId ) {
				const agentManager = getAgentManager();
				const agentId = config.agentId;
				const botId = createOdieBotId( agentId );

				// Only pre-load if agent doesn't exist yet
				if ( ! agentManager.hasAgent( agentId ) ) {
					const cachedData = lastConversationCache.get( botId );
					if ( cachedData?.sessionId === sessionId && cachedData?.messages.length ) {
						// Create agent and load cached messages BEFORE setting config
						await agentManager.createAgent( agentId, config );
						await agentManager.replaceMessages( agentId, cachedData.messages );
					}
				}
			}

			setAgentConfig( config );
		};

		initializeWithCache();
	}, [ config, sessionId ] );

	// Default suggestions - can be overridden via the `customSuggestions` prop
	const defaultSuggestions = useMemo(
		() => [
			{
				id: 'getting-started',
				label: 'Getting started with WordPress',
				prompt: 'How do I get started with WordPress?',
			},
			{
				id: 'create-post',
				label: 'Create a blog post',
				prompt: 'How do I create a blog post?',
			},
			{
				id: 'customize-site',
				label: 'Customize my site',
				prompt: 'How can I customize my site?',
			},
		],
		[]
	);

	// Don't render until agent configuration is initialized
	if ( ! agentConfig ) {
		return null;
	}

	return (
		<AgentDock
			agentConfig={ agentConfig }
			emptyViewSuggestions={ customSuggestions || defaultSuggestions }
			markdownComponents={ markdownComponents }
			markdownExtensions={ markdownExtensions }
		/>
	);
}
