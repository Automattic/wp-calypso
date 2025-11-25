import { createOdieBotId, getAgentManager } from '@automattic/agenttic-client';
import { useCallback, useMemo, useEffect, useState } from '@wordpress/element';
import { CalypsoContextAdapter } from '../../adapters/context/calypso-context-adapter';
import { createAgentConfig, AGENT_ID } from '../../config/agent-config';
import { useOrchestratorSession } from '../../hooks/use-orchestrator-session';
import { lastConversationCache } from '../../utils/conversation-cache';
import AgentDock from '../agent-dock';
import type { UseAgentChatConfig } from '@automattic/agenttic-client';

export interface UnifiedAIAgentProps {
	currentRoute?: string;
	sectionName?: string;
	site?: any;
	currentUser?: any;
	handleClose?: () => void;
	savePreference?: ( key: string, value: any ) => Promise< void >;
	loadPreference?: ( key: string ) => Promise< any >;
}

export default function UnifiedAIAgent( {
	currentRoute,
	sectionName,
	site,
	currentUser,
	handleClose,
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

	const { sessionId, resetSession, applySessionId } = useOrchestratorSession();
	const [ agentConfig, setAgentConfig ] = useState< UseAgentChatConfig | null >( null );
	const siteId = site?.ID;

	// Load config AND pre-load cached messages for progressive loading
	useEffect( () => {
		const initializeWithCache = async () => {
			const newConfig = await createAgentConfig( sessionId, siteId );

			// Check if we have cached messages to pre-load
			if ( sessionId ) {
				const agentManager = getAgentManager();
				const agentKey = AGENT_ID;
				const botId = createOdieBotId( AGENT_ID );

				// Only pre-load if agent doesn't exist yet
				const hasAgent = agentManager.hasAgent( agentKey );

				if ( ! hasAgent ) {
					const cachedData = lastConversationCache.get( botId );

					if (
						cachedData &&
						cachedData.sessionId === sessionId &&
						cachedData.messages.length > 0
					) {
						// Create agent and load cached messages BEFORE setting config
						await agentManager.createAgent( agentKey, {
							...newConfig,
							sessionId,
						} );

						await agentManager.replaceMessages( agentKey, cachedData.messages );
					}
				}
			}

			// Set config to trigger render (with messages if cache existed)
			setAgentConfig( newConfig );
		};

		initializeWithCache();
	}, [ sessionId, siteId ] );

	// Don't render until config is loaded (and cache pre-loaded if available)
	if ( ! agentConfig ) {
		return null;
	}

	return (
		<AgentDock
			// TODO: Implement context detection logic...
			context="wp-admin"
			agentConfig={ agentConfig }
			siteId={ siteId }
			sessionId={ sessionId }
			resetSession={ resetSession }
			applySessionId={ applySessionId }
			preferenceKey="agents_manager_state"
			savePreference={ savePreference }
			loadPreference={ loadPreference }
		/>
	);
}
