/**
 * Calypso AI Agent Component
 * Main wrapper component for loading AI agent in Calypso
 */

import { useCallback, useMemo } from 'react';
import { createCalypsoAuthProvider } from '../../auth/calypso-auth-provider';
import AgentDock from '../agent-dock';
import type { ToolProvider, ContextProvider, ContextEntry } from '../../extension-types';
import type { UseAgentChatConfig, Ability as AgenticAbility } from '@automattic/agenttic-client';
import type { MarkdownComponents, MarkdownExtensions, Suggestion } from '@automattic/agenttic-ui';

export interface UnifiedAIAgentProps {
	/**
	 * Current route/path
	 */
	currentRoute?: string;
	/**
	 * Section name (e.g., 'reader', 'posts', 'pages')
	 */
	sectionName?: string;
	/**
	 * Selected site object
	 */
	site?: any;
	/**
	 * Current user object
	 */
	currentUser?: any;
	/**
	 * Handle close callback
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
	 * Save preference callback (optional, uses wpcomRequest if not provided)
	 */
	savePreference?: ( key: string, value: any ) => Promise< void >;
	/**
	 * Load preference callback (optional, uses wpcomRequest if not provided)
	 */
	loadPreference?: ( key: string ) => Promise< any >;
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

/**
 * CalypsoAIAgent Component
 *
 * Main entry point for AI agent in Calypso.
 * Configures the agent with Calypso-specific context and settings.
 */
export default function CalypsoAIAgent( {
	currentRoute,
	site,
	currentUser,
	toolProvider,
	contextProvider,
	savePreference: externalSavePreference,
	loadPreference: externalLoadPreference,
	emptyViewSuggestions: customSuggestions,
	markdownComponents,
	markdownExtensions,
}: UnifiedAIAgentProps ) {
	// Create agent configuration
	const agentConfig = useMemo< UseAgentChatConfig >( () => {
		const config: UseAgentChatConfig = {
			agentId: 'wp-orchestrator',
			agentUrl: 'https://public-api.wordpress.com/wpcom/v2/ai/agent',
			sessionId: `calypso-${ currentUser?.ID || 'anonymous' }-${ Date.now() }`,
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
	}, [ currentUser, site, currentRoute, toolProvider, contextProvider ] );

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

	const handleClearChat = useCallback( () => {
		// Clear chat handler
	}, [] );

	// Save/load preferences - use provided callbacks or fall back to wpcomRequest
	const defaultSavePreference = useCallback( async ( key: string, value: any ) => {
		if ( typeof window !== 'undefined' && ( window as any ).wpcomRequest ) {
			const wpcomRequest = ( window as any ).wpcomRequest;
			try {
				await wpcomRequest( {
					path: '/me/preferences',
					apiNamespace: 'wpcom/v2',
					method: 'PUT',
					body: {
						calypso_preferences: {
							[ key ]: value,
						},
					},
				} );
			} catch ( error ) {
				// eslint-disable-next-line no-console
				console.warn( '[UnifiedAIAgent] Failed to save preferences:', error );
			}
		}
	}, [] );

	const defaultLoadPreference = useCallback( async ( key: string ) => {
		if ( typeof window !== 'undefined' && ( window as any ).wpcomRequest ) {
			const wpcomRequest = ( window as any ).wpcomRequest;
			try {
				const response = await wpcomRequest( {
					path: '/me/preferences',
					apiNamespace: 'wpcom/v2',
					method: 'GET',
				} );
				return response?.calypso_preferences?.[ key ] || null;
			} catch ( error ) {
				// eslint-disable-next-line no-console
				console.warn( '[UnifiedAIAgent] Failed to load preferences:', error );
			}
		}
		return null;
	}, [] );

	const savePreference = externalSavePreference || defaultSavePreference;
	const loadPreference = externalLoadPreference || defaultLoadPreference;

	return (
		<AgentDock
			agentConfig={ agentConfig }
			emptyViewSuggestions={ suggestions }
			markdownComponents={ markdownComponents }
			markdownExtensions={ markdownExtensions }
			onClearChat={ handleClearChat }
			sessionStorageKey="agents-manager-session"
			preferenceKey="agents_manager_state"
			savePreference={ savePreference }
			loadPreference={ loadPreference }
		/>
	);
}
