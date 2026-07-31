import { getAgentManager, UseAgentChatConfig } from '@automattic/agenttic-client';
import { useSelect } from '@wordpress/data';
import { useEffect, useRef, useState } from '@wordpress/element';
import { store as imageStudioStore } from '../store';

/**
 * The agent manager keys agents by agent ID, so the main chat and every sidebar
 * field share one record and its conversation. Clearing that conversation once
 * per session drops the previous image's turns, which would otherwise be sent
 * with the next message. Removing the agent instead would break whichever
 * consumers are still mounted.
 *
 * Module-level so it survives Image Studio closing and reopening.
 */
let lastClearedSessionId: string | null = null;

function clearConversationForNewSession( agentId: string, sessionId: string ): void {
	if ( lastClearedSessionId === sessionId ) {
		return;
	}
	lastClearedSessionId = sessionId;

	const agentManager = getAgentManager();
	if ( agentManager.hasAgent( agentId ) ) {
		agentManager.replaceMessages( agentId, [] );
	}
}

/**
 * Loads and manages agent configuration for Image Studio.
 *
 * - Loads agent config asynchronously from the provided config factory
 * - Rebuilds it whenever the store mints a new session
 * - Returns null while loading
 * @param agentConfigFactory                   - Factory function to create agent config
 * @param agentConfigFactory.createAgentConfig
 * @returns Loaded agent config or null if still loading
 */
export function useAgentConfig( agentConfigFactory: {
	createAgentConfig: ( sessionId: string ) => Promise< UseAgentChatConfig >;
} ): UseAgentChatConfig | null {
	const [ agentConfigState, setAgentConfigState ] = useState< UseAgentChatConfig | null >( null );

	// Held in a ref so a caller passing a fresh factory each render cannot
	// rebuild mid-conversation. Only a new session rebuilds.
	const agentConfigFactoryRef = useRef( agentConfigFactory );
	agentConfigFactoryRef.current = agentConfigFactory;

	const sessionId = useSelect( ( select ) => select( imageStudioStore ).getSessionId(), [] );

	useEffect( () => {
		if ( ! sessionId ) {
			return;
		}

		let mounted = true;

		// Until the new session's config lands, the chat has nowhere valid to
		// send: the previous config points at the conversation just cleared.
		setAgentConfigState( null );

		agentConfigFactoryRef.current
			.createAgentConfig( sessionId )
			.then( ( loadedConfig ) => {
				if ( mounted ) {
					clearConversationForNewSession( loadedConfig.agentId, sessionId );
					setAgentConfigState( loadedConfig );
				}
			} )
			.catch( ( error ) => {
				window.console?.error?.( '[Image Studio] Error loading agent config:', error );
			} );

		return () => {
			mounted = false;
		};
	}, [ sessionId ] );

	return agentConfigState;
}
