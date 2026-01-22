import { getAgentManager } from '@automattic/agenttic-client';
import { useEffect, useState } from '@wordpress/element';

import { getSessionId } from '../utils/session';

/**
 * Loads and manages agent configuration for Image Studio.
 *
 * - Loads agent config asynchronously from the provided config factory
 * - Manages session ID from the session utility
 * - Handles agent cleanup on unmount
 * - Returns null while loading
 *
 * @param agentConfigFactory                   - Factory function to create agent config
 * @param agentConfigFactory.createAgentConfig
 * @param modalOpenKey                         - Key that changes when modal reopens (triggers reload)
 * @return Loaded agent config or null if still loading
 */
export function useAgentConfig(
	agentConfigFactory: {
		createAgentConfig: ( sessionId: string ) => Promise< any >;
	},
	modalOpenKey?: number
) {
	const [ agentConfigState, setAgentConfigState ] = useState< any >( null );

	// Get session ID from the session utility
	const sessionId = getSessionId();

	useEffect( () => {
		let mounted = true;
		let agentKey: string | null = null;

		// Use session ID from the store
		const currentSessionId = sessionId || 'wp-orchestrator-default';

		agentConfigFactory
			.createAgentConfig( currentSessionId )
			.then( ( loadedConfig ) => {
				if ( mounted ) {
					setAgentConfigState( loadedConfig );
					agentKey = `${ loadedConfig.agentId }-${ currentSessionId }`;
				}
			} )
			.catch( ( error ) => {
				// eslint-disable-next-line no-console
				console.error( '[Image Studio] Error loading agent config:', error );
			} );

		return () => {
			mounted = false;

			if ( agentKey ) {
				const agentManager = getAgentManager();
				if ( agentManager.hasAgent( agentKey ) ) {
					agentManager.removeAgent( agentKey );
				}
			}
		};
	}, [ agentConfigFactory, modalOpenKey, sessionId ] );

	return agentConfigState;
}
