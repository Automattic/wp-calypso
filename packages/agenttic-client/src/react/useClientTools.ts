import { useCallback, useMemo } from 'react';
import { logger } from '../client/utils/logger';
import type {
	Ability,
	ExecuteAbilityFunction,
	Tool,
	ToolProvider,
} from '../client/types/index';
import { convertAbilitiesToTools } from '../utils/wordpressAbilities';

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
	executeAbility?: ExecuteAbilityFunction;
}

/**
 * Internal shared custom hook for all tool provider hooks
 *
 * @param root0                - Configuration object
 * @param root0.getClientTools - Function to get tools
 * @param root0.executeTool    - Function to execute tools
 * @param root0.abilities      - Array of abilities
 * @param root0.executeAbility - Function to execute abilities
 * @return ToolProvider instance or undefined
 */
function useToolProviderFromConfig( {
	getClientTools,
	executeTool,
	abilities,
	executeAbility,
}: {
	getClientTools?: GetClientToolsCallback;
	executeTool?: ExecuteToolCallback;
	abilities?: Ability[];
	executeAbility?: ExecuteAbilityFunction;
} ): ToolProvider | undefined {
	const abilityTools = useMemo( () => {
		if ( ! abilities || abilities.length === 0 ) {
			return [];
		}
		return convertAbilitiesToTools( abilities );
	}, [ abilities ] );

	const abilityMap = useMemo( () => {
		if ( ! abilities || abilities.length === 0 ) {
			return new Map< string, Ability >();
		}
		// Map converted tool IDs (with "-") to original abilities for execution
		// Abilities use "/" as separator, but tool IDs use "-"
		return new Map(
			abilities.map( ( a ) => [ a.name.replace( /\//g, '-' ), a ] )
		);
	}, [ abilities ] );

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

		if ( abilityTools.length > 0 ) {
			tools.push( ...abilityTools );
		}

		return tools;
	}, [ getClientTools, abilityTools ] );

	const executeToolCallback = useCallback(
		async ( toolId: string, args: any ): Promise< any > => {
			const ability = abilityMap.get( toolId );

			if ( ability ) {
				try {
					// Execute with the original ability name (with "/")
					// toolId has "/" replaced with "-", but executeAbility needs the original name
					const result = await executeAbility!( ability.name, args );
					logger( `Executed Ability: ${ ability.name }` );
					return {
						result,
						returnToAgent: true,
					};
				} catch ( error ) {
					logger(
						'Error executing ability %s: %O',
						ability.name,
						error
					);
					return {
						result: {
							error:
								error instanceof Error
									? error.message
									: String( error ),
							success: false,
						},
						returnToAgent: true,
					};
				}
			}

			// Not an ability, execute as regular tool
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
		[ executeTool, abilityMap, executeAbility ]
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
		executeAbility: undefined,
	} );
}

/**
 * React hook that creates a ToolProvider for WordPress Abilities
 *
 * This hook converts WordPress Abilities to tools and provides a ToolProvider
 * that executes them using the WordPress Abilities API.
 *
 * @param abilities      - Array of WordPress Abilities from @wordpress/abilities
 * @param executeAbility - Function to execute abilities (from @wordpress/abilities)
 * @return ToolProvider instance or undefined if no abilities provided
 *
 * @example
 * ```typescript
 * import { getAbilities, executeAbility } from '@wordpress/abilities';
 *
 * const abilities = await getAbilities();
 * const toolProvider = useClientAbilities(abilities, executeAbility);
 * ```
 */
export function useClientAbilities(
	abilities: Ability[],
	executeAbility: ExecuteAbilityFunction
): ToolProvider | undefined {
	// Validate that executeAbility is provided
	if ( abilities.length > 0 && ! executeAbility ) {
		throw new Error(
			'executeAbility is required when providing abilities. ' +
				'Please provide the executeAbility function from @wordpress/abilities.'
		);
	}

	return useToolProviderFromConfig( {
		getClientTools: undefined,
		executeTool: undefined,
		abilities,
		executeAbility,
	} );
}

/**
 * React hook that creates a ToolProvider for both tools and WordPress Abilities
 *
 * This hook accepts a configuration object that supports both regular tools
 * and WordPress Abilities. Abilities are automatically converted to tools and
 * merged with regular tools.
 *
 * @param config - Configuration object with tools, abilities, and execution functions
 * @return ToolProvider instance or undefined if no tools/abilities provided
 *
 * @example
 * ```typescript
 * import { getAbilities, executeAbility } from '@wordpress/abilities';
 *
 * const abilities = await getAbilities();
 * const toolProvider = useClientToolsWithAbilities({
 *   getClientTools: async () => [...myTools],
 *   executeTool: async (toolId, args) => { ... },
 *   abilities,
 *   executeAbility,
 * });
 * ```
 */
export function useClientToolsWithAbilities(
	config: UseClientToolsWithAbilitiesConfig
): ToolProvider | undefined {
	const { getClientTools, executeTool, abilities, executeAbility } = config;

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

	if ( abilities && abilities.length > 0 && ! executeAbility ) {
		throw new Error(
			'executeAbility is required when providing abilities. ' +
				'Please provide the executeAbility function from @wordpress/abilities.'
		);
	}

	return useToolProviderFromConfig( {
		getClientTools,
		executeTool,
		abilities,
		executeAbility,
	} );
}
