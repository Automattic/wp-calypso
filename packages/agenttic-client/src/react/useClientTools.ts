import { useCallback, useMemo } from 'react';
import { logger } from '../client/utils/logger';
import type { Ability, Tool, ToolProvider } from '../client/types/index';

/**
 * Callback function type for getting tools
 */
export type GetClientToolsCallback = () => Promise< Tool[] >;

/**
 * Callback function type for executing tools
 */
export type ExecuteToolCallback = (
	toolId: string,
	args: any
) => Promise< any >;

/**
 * Configuration for useClientToolsWithAbilities hook
 */
export interface UseClientToolsWithAbilitiesConfig {
	getClientTools?: GetClientToolsCallback;
	executeTool?: ExecuteToolCallback;
	abilities?: Ability[];
}

/**
 * Internal shared custom hook for all tool provider hooks
 *
 * @param root0                - Configuration object
 * @param root0.getClientTools - Function to get tools
 * @param root0.executeTool    - Function to execute tools
 * @param root0.abilities      - Array of abilities
 * @return ToolProvider instance or undefined
 */
function useToolProviderFromConfig( {
	getClientTools,
	executeTool,
	abilities,
}: {
	getClientTools?: GetClientToolsCallback;
	executeTool?: ExecuteToolCallback;
	abilities?: Ability[];
} ): ToolProvider | undefined {
	const getAvailableTools = useCallback( async (): Promise< Tool[] > => {
		const tools: Tool[] = [];

		if ( getClientTools ) {
			try {
				const clientTools = await getClientTools();
				tools.push( ...clientTools );
			} catch ( error ) {
				logger( 'Error getting available tools: %O', error );
			}
		}

		return tools;
	}, [ getClientTools ] );

	const executeToolCallback = useCallback(
		async ( toolId: string, args: any ): Promise< any > => {
			if ( ! executeTool ) {
				throw new Error( 'No executeTool callback provided' );
			}

			try {
				return await executeTool( toolId, args );
			} catch ( error ) {
				logger( 'Error executing tool %s: %O', toolId, error );
				throw error;
			}
		},
		[ executeTool ]
	);

	// Create the ToolProvider instance
	const toolProvider = useMemo( (): ToolProvider | undefined => {
		if ( ! getClientTools && ( ! abilities || abilities.length === 0 ) ) {
			return undefined;
		}

		return {
			getAvailableTools,
			executeTool: executeToolCallback,
			abilities,
		};
	}, [ getAvailableTools, executeToolCallback, getClientTools, abilities ] );

	return toolProvider;
}

/**
 * React hook that creates a ToolProvider for regular tools
 *
 * This hook takes separate callback functions for getting tools and executing tools.
 * It wraps them in the ToolProvider interface expected by the agenttic client.
 * The callbacks are called fresh each time, ensuring dynamic tool availability and execution.
 * Tool results are automatically handled by the A2A client.
 *
 * @param getClientTools - Function that returns available tools as an array of Tool objects
 * @param executeTool    - Function that executes a tool with the arguments returned by the agent
 * @return ToolProvider instance or undefined if no getClientTools callback provided
 *
 * @example
 * ```typescript
 * const toolProvider = useClientTools(
 *   async () => [...myTools],
 *   async (toolId, args) => {
 *     // Execute tool logic
 *   }
 * );
 * ```
 */
export function useClientTools(
	getClientTools: GetClientToolsCallback,
	executeTool: ExecuteToolCallback
): ToolProvider | undefined {
	return useToolProviderFromConfig( {
		getClientTools,
		executeTool,
		abilities: undefined,
	} );
}

/**
 * React hook that creates a ToolProvider for WordPress Abilities
 *
 * This hook converts WordPress Abilities to tools and provides a ToolProvider
 * that executes them using the WordPress Abilities API.
 *
 * @param abilities - Array of WordPress Abilities from @wordpress/abilities
 * @return ToolProvider instance or undefined if no abilities provided
 *
 * @example
 * ```typescript
 * import { getAbilities } from '@wordpress/abilities';
 *
 * const abilities = await getAbilities();
 * const toolProvider = useClientAbilities(abilities);
 * ```
 */
export function useClientAbilities(
	abilities: Ability[]
): ToolProvider | undefined {
	return useToolProviderFromConfig( {
		getClientTools: undefined,
		executeTool: undefined,
		abilities,
	} );
}

/**
 * React hook that creates a ToolProvider for both tools and WordPress Abilities
 *
 * This hook accepts a configuration object that supports both regular tools
 * and WordPress Abilities.
 *
 * @param config - Configuration object with tools and abilities
 * @return ToolProvider instance or undefined if no tools/abilities provided
 *
 * @example
 * ```typescript
 * import { getAbilities } from '@wordpress/abilities';
 *
 * const abilities = await getAbilities();
 * const toolProvider = useClientToolsWithAbilities({
 *   getClientTools: async () => [...myTools],
 *   executeTool: async (toolId, args) => { ... },
 *   abilities,
 * });
 * ```
 */
export function useClientToolsWithAbilities(
	config: UseClientToolsWithAbilitiesConfig
): ToolProvider | undefined {
	const { getClientTools, executeTool, abilities } = config;

	// Validate that at least one type is provided
	if ( ! getClientTools && ( ! abilities || abilities.length === 0 ) ) {
		throw new Error(
			'At least one of getClientTools or abilities must be provided to useClientToolsWithAbilities.'
		);
	}

	// Validate executors are provided when needed
	if ( getClientTools && ! executeTool ) {
		throw new Error(
			'executeTool is required when providing getClientTools.'
		);
	}

	return useToolProviderFromConfig( {
		getClientTools,
		executeTool,
		abilities,
	} );
}
