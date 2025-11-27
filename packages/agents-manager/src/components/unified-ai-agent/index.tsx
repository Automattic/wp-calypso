/**
 * Unified AI Agent Component
 *
 * Main wrapper component for loading the AI agent.
 */

import { useMemo } from '@wordpress/element';
import { createCalypsoAuthProvider } from '../../auth/calypso-auth-provider';
import useAgentSession from '../../hooks/use-agent-session';
import AgentDock from '../agent-dock';
import type { ToolProvider, ContextProvider, ContextEntry } from '../../extension-types';
import type { UseAgentChatConfig, Ability as AgenticAbility } from '@automattic/agenttic-client';
import type { MarkdownComponents, MarkdownExtensions, Suggestion } from '@automattic/agenttic-ui';

export interface UnifiedAIAgentProps {
	/**
	 * The current route path.
	 */
	currentRoute?: string;
	/**
	 * The name of the current section (e.g., 'posts', 'pages').
	 */
	sectionName?: string;
	/**
	 * The selected site object.
	 */
	site?: Record< string, any >;
	/**
	 * The current user object.
	 */
	currentUser?: Record< string, any >;
	/**
	 * Callback to handle closing the agent.
	 */
	handleClose?: () => void;
	/**
	 * Tool provider for abilities (optional)
	 * Allows plugins to provide custom abilities to the agent
	 */
	toolProvider?: ToolProvider;
	/**
	 * Context provider for environment-specific context (optional)
	 * Allows plugins to provide rich context about current state
	 */
	contextProvider?: ContextProvider;
	/**
	 * Custom suggestions for the empty view (optional)
	 * Allows plugins to provide context-specific suggestions
	 */
	emptyViewSuggestions?: Suggestion[];
	/**
	 * Custom markdown components for message rendering (optional)
	 * Allows plugins to provide custom renderers for markdown elements
	 */
	markdownComponents?: MarkdownComponents;
	/**
	 * Custom markdown extensions (optional)
	 */
	markdownExtensions?: MarkdownExtensions;
}

/**
 * Resolve context entries by calling getData() closures
 *
 * Takes context entries with optional getData() closures and resolves them
 * by calling getData() to populate the data field. The getData function is
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

export default function UnifiedAIAgent( {
	currentRoute,
	site,
	toolProvider,
	contextProvider,
	emptyViewSuggestions: customSuggestions,
	markdownComponents,
	markdownExtensions,
}: UnifiedAIAgentProps ) {
	// TODO: Migrate to the routing solution...
	const { sessionId, resetSession, applySessionId } = useAgentSession();

	// Create agent configuration
	const agentConfig = useMemo< UseAgentChatConfig >(
		() => {
			const config: UseAgentChatConfig = {
				agentId: 'wp-orchestrator',
				agentUrl: 'https://public-api.wordpress.com/wpcom/v2/ai/agent',
				sessionId: sessionId,
				authProvider: createCalypsoAuthProvider( site?.ID ),
				enableStreaming: true,
			};

			// Add tool provider if provided by plugin
			if ( toolProvider ) {
				// Wrap toolProvider to filter out null annotation values
				// WordPress Abilities API uses null, but agenttic-client expects undefined
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

						// Resolve contextEntries if present
						if ( pluginContext.contextEntries && pluginContext.contextEntries.length > 0 ) {
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
		// eslint-disable-next-line react-hooks/exhaustive-deps -- prevents agent reinitialization
		[]
	);

	// Default suggestions - can be overridden via customSuggestions prop
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
	const suggestions = customSuggestions || defaultSuggestions;

	return (
		<AgentDock
			agentConfig={ agentConfig }
			sessionId={ sessionId }
			resetSession={ resetSession }
			applySessionId={ applySessionId }
			emptyViewSuggestions={ suggestions }
			markdownComponents={ markdownComponents }
			markdownExtensions={ markdownExtensions }
		/>
	);
}
