import { getAgentManager, UseAgentChatConfig } from '@automattic/agenttic-client';
import { useSelect } from '@wordpress/data';
import { useEffect, useState } from '@wordpress/element';
import { store as imageStudioStore } from '../store';

/**
 * Loads and manages agent configuration for Image Studio.
 *
 * - Loads agent config asynchronously from the provided config factory
 * - Rebuilds it whenever the store mints a new session
 * - Handles agent cleanup on unmount
 * - Returns null while loading
 * @param agentConfigFactory                   - Factory function to create agent config
 * @param agentConfigFactory.createAgentConfig
 * @returns Loaded agent config or null if still loading
 */
export function useAgentConfig( agentConfigFactory: {
	createAgentConfig: ( sessionId: string ) => Promise< UseAgentChatConfig >;
} ): UseAgentChatConfig | null {
	const [ agentConfigState, setAgentConfigState ] = useState< UseAgentChatConfig | null >( null );

	const sessionId = useSelect( ( select ) => select( imageStudioStore ).getSessionId(), [] );

	useEffect( () => {
		if ( ! sessionId ) {
			return;
		}

		let mounted = true;
		let agentKey: string | null = null;

		agentConfigFactory
			.createAgentConfig( sessionId )
			.then( ( loadedConfig ) => {
				if ( mounted ) {
					setAgentConfigState( loadedConfig );
					agentKey = `${ loadedConfig.agentId }-${ sessionId }`;
				}
			} )
			.catch( ( error ) => {
				window.console?.error?.( '[Image Studio] Error loading agent config:', error );
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
	}, [ agentConfigFactory, sessionId ] );

	return agentConfigState;
}
