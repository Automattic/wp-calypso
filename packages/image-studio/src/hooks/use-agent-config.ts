import { getAgentManager } from '@automattic/agenttic-client';
import { useEffect, useMemo, useState } from '@wordpress/element';
import { getSessionId } from '../utils/session';

/**
 * Loads and manages agent configuration for Image Studio.
 *
 * - Loads agent config asynchronously from the provided config factory
 * - Manages session ID from the store
 * - Handles agent cleanup on unmount
 * - Returns null while loading
 * @param agentConfigFactory                   - Factory function to create agent config
 * @param agentConfigFactory.createAgentConfig
 * @param modalOpenKey                         - Key that changes when modal reopens (triggers reload)
 * @returns Loaded agent config or null if still loading
 */
export function useAgentConfig(
	agentConfigFactory: {
		createAgentConfig: ( sessionId: string ) => Promise< any >;
	},
	modalOpenKey?: number
) {
	const [ agentConfigState, setAgentConfigState ] = useState< any >( null );

	const sessionId = getSessionId();
	const sessionKey = useMemo( () => sessionId || 'image-studio-default', [ sessionId ] );

	useEffect( () => {
		let mounted = true;
		let agentKey: string | null = null;

		agentConfigFactory
			.createAgentConfig( sessionKey )
			.then( ( loadedConfig ) => {
				if ( mounted ) {
					setAgentConfigState( loadedConfig );
					agentKey = `${ loadedConfig.agentId }-${ sessionKey }`;
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
	}, [ agentConfigFactory, modalOpenKey, sessionKey ] );

	return agentConfigState;
}
