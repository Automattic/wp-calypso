/**
 * Calypso AI Agent Component
 * Main wrapper component for loading AI agent in Calypso
 */

import { useCallback, useMemo } from 'react';
import { CalypsoChromeAdapter } from '../../adapters/chrome/CalypsoChromeAdapter';
import { CalypsoContextAdapter } from '../../adapters/context/CalypsoContextAdapter';
import AgentDock from '../AgentDock';
import type { UseAgentChatConfig } from '@automattic/agenttic-client';

export interface CalypsoAIAgentProps {
	/**
	 * Container selector for the agent dock
	 */
	containerSelector: string;
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
}

/**
 * CalypsoAIAgent Component
 *
 * Main entry point for AI agent in Calypso.
 * Configures the agent with Calypso-specific context and settings.
 */
export default function CalypsoAIAgent( {
	containerSelector,
	currentRoute,
	sectionName,
	site,
	currentUser,
}: CalypsoAIAgentProps ) {
	// Create context adapter for Calypso
	// TODO: Pass this to AgentDock once context integration is needed
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const _contextAdapter = useMemo( () => {
		return new CalypsoContextAdapter( sectionName || 'unknown', async () => ( {
			site,
			currentRoute,
		} ) );
	}, [ sectionName, site, currentRoute ] );

	// Create chrome adapter for Calypso
	const chromeAdapter = useMemo( () => {
		return new CalypsoChromeAdapter( containerSelector );
	}, [ containerSelector ] );

	// Create agent configuration
	const agentConfig = useMemo< UseAgentChatConfig >(
		() => ( {
			agentId: 'calypso-assistant',
			agentUrl: '/api/ai/chat', // This will need to be configured
			sessionId: `calypso-${ currentUser?.ID || 'anonymous' }-${ Date.now() }`,
			// TODO: Add abilities and other configuration
		} ),
		[ currentUser ]
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

	// Save/load preferences using wpcomRequest
	const savePreference = useCallback( async ( key: string, value: any ) => {
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
				console.warn( '[CalypsoAIAgent] Failed to save preferences:', error );
			}
		}
	}, [] );

	const loadPreference = useCallback( async ( key: string ) => {
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
				console.warn( '[CalypsoAIAgent] Failed to load preferences:', error );
			}
		}
		return null;
	}, [] );

	return (
		<AgentDock
			agentConfig={ agentConfig }
			chromeAdapter={ chromeAdapter }
			containerSelector={ containerSelector }
			emptyViewSuggestions={ suggestions }
			emptyViewHeading="How can I help you today?"
			emptyViewHelp="Ask me anything about WordPress and your site."
			onClearChat={ handleClearChat }
			sessionStorageKey="calypso-ai-agent-session"
			chatStateStorageKey="calypso-ai-agent-chat-state"
			dockStateStorageKey="calypso-ai-agent-docked"
			preferenceKey="calypso_ai_agent_state"
			savePreference={ savePreference }
			loadPreference={ loadPreference }
		/>
	);
}
