import { useCallback, useMemo } from '@wordpress/element';
import { logger } from '../utils/logger';
import type { Tool, ToolProvider } from '../types/index';

/**
 * Callback function type for getting tools data
 */
export type GetClientToolsCallback = () => {
	getTools: () => Promise< Tool[] >;
	executeTool: ( toolId: string, args: any ) => Promise< any >;
};

/**
 * React hook that creates a ToolProvider
 *
 * This hook takes a callback function that returns a getTools and executeTool method.
 * It wraps it in the ToolProvider interface expected by the agenttic client.
 * The callback is called fresh each time tools are needed, ensuring dynamic
 * tool availability and execution.
 *
 * @param getClientToolsCallback - Function that returns getTools and executeTool methods
 * @return ToolProvider instance or undefined if no callback provided
 */
export function useClientTools(
	getClientToolsCallback?: GetClientToolsCallback
): ToolProvider | undefined {
	// Create stable callback references
	const getAvailableTools = useCallback( async (): Promise< Tool[] > => {
		if ( ! getClientToolsCallback ) {
			return [];
		}

		try {
			const { getTools } = getClientToolsCallback();
			return await getTools();
		} catch ( error ) {
			logger( 'Error getting available tools: %O', error );
			return [];
		}
	}, [ getClientToolsCallback ] );

	const executeTool = useCallback(
		async ( toolId: string, args: any ): Promise< any > => {
			if ( ! getClientToolsCallback ) {
				throw new Error( 'No tools callback provided' );
			}

			try {
				const { executeTool: executeToolFn } = getClientToolsCallback();
				return await executeToolFn( toolId, args );
			} catch ( error ) {
				logger( 'Error executing tool %s: %O', toolId, error );
				throw error;
			}
		},
		[ getClientToolsCallback ]
	);

	// Create the ToolProvider instance
	const toolProvider = useMemo( (): ToolProvider | undefined => {
		if ( ! getClientToolsCallback ) {
			return undefined;
		}

		return {
			getAvailableTools,
			executeTool,
		};
	}, [ getAvailableTools, executeTool, getClientToolsCallback ] );

	return toolProvider;
}
