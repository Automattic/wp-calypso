import { useCallback, useMemo } from '@wordpress/element';
import { logger } from '../utils/logger';
import type { Tool, ToolProvider, ToolResultDataPart } from '../types/index';

/**
 * Callback function type for getting tools data
 */
export type GetClientToolsCallback = () => {
	getTools: () => Promise< Tool[] >;
	executeTool: ( toolId: string, args: any ) => Promise< any >;
};

/**
 * Callback function type for handling tool completion
 */
export type OnToolCompletionCallback = (
	toolResult: ToolResultDataPart
) => void | Promise< void >;

/**
 * React hook that creates a ToolProvider
 *
 * This hook takes a callback function that returns a getTools and executeTool method,
 * and an optional onToolCompletion callback for handling tool results.
 * It wraps them in the ToolProvider interface expected by the agenttic client.
 * The callback is called fresh each time tools are needed, ensuring dynamic
 * tool availability and execution.
 *
 * @param getClientToolsCallback - Function that returns getTools and executeTool methods
 * @param onToolCompletion       - Optional callback for handling tool completion results
 * @return ToolProvider instance or undefined if no callback provided
 */
export function useClientTools(
	getClientToolsCallback?: GetClientToolsCallback,
	onToolCompletion?: OnToolCompletionCallback
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
		if ( ! getClientToolsCallback ) {
			return undefined;
		}

		return {
			getAvailableTools,
			executeTool,
			onToolCompletion: onToolCompletion
				? stableOnToolCompletion
				: undefined,
		};
	}, [
		getAvailableTools,
		executeTool,
		stableOnToolCompletion,
		getClientToolsCallback,
		onToolCompletion,
	] );

	return toolProvider;
}
