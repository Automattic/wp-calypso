/**
 * Agent Configuration Utilities
 */

import type { Ability } from '../abilities/ability-registry';
import type { ContextAdapter } from '../adapters/context/context-adapter';
import type { UseAgentChatConfig } from '@automattic/agenttic-client';

export interface CreateAgentConfigOptions {
	/**
	 * Unique agent ID
	 */
	agentId: string;
	/**
	 * Agent API URL
	 */
	agentUrl: string;
	/**
	 * Session ID for this conversation
	 */
	sessionId: string;
	/**
	 * Context adapter for providing environment context
	 */
	contextAdapter?: ContextAdapter;
	/**
	 * Abilities available to the agent
	 */
	abilities?: Ability[];
	/**
	 * Enable streaming responses
	 */
	streaming?: boolean;
	/**
	 * Custom markdown components for rendering
	 */
	markdownComponents?: Record< string, any >;
	/**
	 * Custom markdown extensions
	 */
	markdownExtensions?: any[];
	/**
	 * Additional configuration options
	 */
	additionalConfig?: Record< string, any >;
}

/**
 * Create an agent configuration for @automattic/agenttic-client
 * @param {CreateAgentConfigOptions} options - Configuration options
 * @returns {Promise<UseAgentChatConfig>} Agent configuration
 */
export async function createAgentConfig( {
	agentId,
	agentUrl,
	sessionId,
	contextAdapter,
	abilities = [],
	streaming = true,
	additionalConfig = {},
}: CreateAgentConfigOptions ): Promise< UseAgentChatConfig > {
	// Get context from adapter if available
	let clientContext = {};
	if ( contextAdapter ) {
		try {
			const context = await contextAdapter.getContext();
			clientContext = {
				url: context.url,
				pathname: context.pathname,
				environment: context.environment,
				...( context.additionalData || {} ),
			};
		} catch ( error ) {
			// eslint-disable-next-line no-console
			console.warn( '[createAgentConfig] Failed to get context:', error );
		}
	}

	// Convert abilities to the format expected by agenttic-client
	const agentAbilities = abilities.map( ( ability ) => ( {
		name: ability.name,
		description: ability.description || '',
		execute: ability.execute,
		schema: ability.schema,
	} ) );

	return {
		agentId,
		agentUrl,
		sessionId,
		streaming,
		abilities: agentAbilities,
		context: clientContext,
		...additionalConfig,
	} as UseAgentChatConfig;
}

/**
 * Create a simple agent config without abilities or context
 * @param {string} agentId - Agent ID
 * @param {string} agentUrl - Agent API URL
 * @param {string} sessionId - Session ID
 * @returns {UseAgentChatConfig} Basic agent configuration
 */
export function createSimpleAgentConfig(
	agentId: string,
	agentUrl: string,
	sessionId: string
): UseAgentChatConfig {
	return {
		agentId,
		agentUrl,
		sessionId,
		streaming: true,
		abilities: [],
		context: {},
	} as UseAgentChatConfig;
}
