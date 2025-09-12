import { useCallback, useMemo } from 'react';
import { logger } from '../client/utils/logger';
import type { Tool, ToolProvider } from '../client/types/index';

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
 * React hook that creates a ToolProvider
 *
 * This hook takes separate callback functions for getting tools and executing tools.
 * It wraps them in the ToolProvider interface expected by the agenttic client.
 * The callbacks are called fresh each time, ensuring dynamic tool availability and execution.
 * Tool results are automatically handled by the A2A client.
 *
 * @param getClientTools - Function that returns available tools as an array of Tool objects
 * @param executeTool    - Function that executes a tool with the arguments returned by the agent
 * @return ToolProvider instance or undefined if no getClientTools callback provided
 */
export function useClientTools(
	getClientTools?: GetClientToolsCallback,
	executeTool?: ExecuteToolCallback
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

	// Create the ToolProvider instance
	const toolProvider = useMemo( (): ToolProvider | undefined => {
		if ( ! getClientTools ) {
			return undefined;
		}

		return {
			getAvailableTools: stableGetAvailableTools,
			executeTool: stableExecuteTool,
		};
	}, [ stableGetAvailableTools, stableExecuteTool, getClientTools ] );

	return toolProvider;
}
