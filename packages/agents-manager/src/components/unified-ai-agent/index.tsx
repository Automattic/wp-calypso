/**
 * Calypso AI Agent Component
 * Main wrapper component for loading AI agent in Calypso
 */

import { useCallback, useMemo } from 'react';
import { CalypsoContextAdapter } from '../../adapters/context/calypso-context-adapter';
import { createCalypsoAuthProvider } from '../../auth/calypso-auth-provider';
import AgentDock from '../agent-dock';
import type { UseAgentChatConfig } from '@automattic/agenttic-client';

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
	 * Save preference callback (optional, uses wpcomRequest if not provided)
	 */
	savePreference?: ( key: string, value: any ) => Promise< void >;
	/**
	 * Load preference callback (optional, uses wpcomRequest if not provided)
	 */
	loadPreference?: ( key: string ) => Promise< any >;
}

/**
 * CalypsoAIAgent Component
 *
 * Main entry point for AI agent in Calypso.
 * Configures the agent with Calypso-specific context and settings.
 */
export default function CalypsoAIAgent( {
	currentRoute,
	sectionName,
	site,
	currentUser,
	savePreference: externalSavePreference,
	loadPreference: externalLoadPreference,
}: UnifiedAIAgentProps ) {
	// Create context adapter for Calypso
	// TODO: Pass this to AgentDock once context integration is needed
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const _contextAdapter = useMemo( () => {
		return new CalypsoContextAdapter( sectionName || 'unknown', async () => ( {
			site,
			currentRoute,
		} ) );
	}, [ sectionName, site, currentRoute ] );

	// Create agent configuration
	const agentConfig = useMemo< UseAgentChatConfig >(
		() => ( {
			agentId: 'wp-orchestrator',
			agentUrl: 'https://public-api.wordpress.com/wpcom/v2/ai/agent',
			sessionId: `calypso-${ currentUser?.ID || 'anonymous' }-${ Date.now() }`,
			authProvider: createCalypsoAuthProvider( site?.ID ),
			enableStreaming: true,
			// TODO: Add context provider and abilities
		} ),
		[ currentUser, site?.ID ]
	);

	// Empty suggestions for now - can be customized per section
	const suggestions = useMemo(
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
			onClearChat={ handleClearChat }
			sessionStorageKey="agents-manager-session"
			preferenceKey="agents_manager_state"
			savePreference={ savePreference }
			loadPreference={ loadPreference }
		/>
	);
}
