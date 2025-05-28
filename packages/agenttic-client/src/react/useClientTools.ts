import { useCallback, useMemo } from '@wordpress/element';
import { logger } from '../utils/logger';
import type { Tool, ToolProvider, ToolResultDataPart } from '../types/index';

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
 * Callback function type for handling tool completion
 */
export type OnToolCompletionCallback = (
	toolResult: ToolResultDataPart
) => void | Promise< void >;

/**
 * React hook that creates a ToolProvider
 *
 * This hook takes separate callback functions for getting tools, executing tools,
 * and handling tool completion. It wraps them in the ToolProvider interface
 * expected by the agenttic client. The callbacks are called fresh each time,
 * ensuring dynamic tool availability and execution.
 *
 * @param getClientTools   - Function that returns available tools
 * @param executeTool      - Function that executes a tool with given arguments
 * @param onToolCompletion - Optional callback for handling tool completion results
 * @return ToolProvider instance or undefined if no getClientTools callback provided
 */
export function useClientTools(
	getClientTools?: GetClientToolsCallback,
	executeTool?: ExecuteToolCallback,
	onToolCompletion?: OnToolCompletionCallback
): ToolProvider | undefined {
	const stableGetAvailableTools = useCallback( async (): Promise<
		Tool[]
	> => {
		if ( ! getClientTools ) {
			return [];
		}

		try {
			return await getClientTools();
		} catch ( error ) {
			logger( 'Error getting available tools: %O', error );
			return [];
		}
	}, [ getClientTools ] );

	const stableExecuteTool = useCallback(
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

	// Create stable onToolCompletion callback
	const stableOnToolCompletion = useCallback(
		( toolResult: ToolResultDataPart ) => {
			if ( onToolCompletion ) {
				try {
					const result = onToolCompletion( toolResult );
					// Handle async callbacks
					if ( result && typeof result.then === 'function' ) {
						result.catch( ( error ) => {
							logger(
								'Error in onToolCompletion callback: %O',
								error
							);
						} );
					}
				} catch ( error ) {
					logger( 'Error in onToolCompletion callback: %O', error );
				}
			}
		},
		[ onToolCompletion ]
	);

	// Create the ToolProvider instance
	const toolProvider = useMemo( (): ToolProvider | undefined => {
		if ( ! getClientTools ) {
			return undefined;
		}

		return {
			getAvailableTools: stableGetAvailableTools,
			executeTool: stableExecuteTool,
			onToolCompletion: onToolCompletion
				? stableOnToolCompletion
				: undefined,
		};
	}, [
		stableGetAvailableTools,
		stableExecuteTool,
		stableOnToolCompletion,
		getClientTools,
		onToolCompletion,
	] );

	return toolProvider;
}
