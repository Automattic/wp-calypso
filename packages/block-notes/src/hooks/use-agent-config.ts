import { useSelect } from '@wordpress/data';
import { useEffect, useState } from '@wordpress/element';
import { store as aiStore } from '../store';
import type { UseAgentChatConfig } from '@automattic/agenttic-client';

/**
 * Loads and manages agent configuration for Block Notes.
 *
 * - Loads agent config asynchronously from the provided config factory
 * - Manages session ID from the store
 * - Returns null while loading
 * @param agentConfigFactory                   - Factory function to create agent config
 * @param agentConfigFactory.createAgentConfig - Function to create agent config given a session ID
 * @returns Loaded agent config or null if still loading
 */
export function useAgentConfig( agentConfigFactory: {
	createAgentConfig: ( sessionId: string ) => Promise< UseAgentChatConfig >;
} ) {
	const [ agentConfigState, setAgentConfigState ] = useState< UseAgentChatConfig | null >( null );

	// Get session ID from the store
	const sessionId = useSelect( ( select ) => select( aiStore ).getSessionId(), [] );

	useEffect( () => {
		let mounted = true;

		// Use session ID from the store
		const currentSessionId = sessionId || 'wp-orchestrator-default';

		agentConfigFactory
			.createAgentConfig( currentSessionId )
			.then( ( loadedConfig ) => {
				if ( mounted ) {
					setAgentConfigState( loadedConfig );
				}
			} )
			.catch( ( error ) => {
				// eslint-disable-next-line no-console
				console.error( '[Block Notes] Error loading agent config:', error );
			} );

		return () => {
			mounted = false;
		};
	}, [ agentConfigFactory, sessionId ] );

	return agentConfigState;
}
