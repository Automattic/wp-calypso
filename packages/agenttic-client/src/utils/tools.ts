import type { Message, Task, ToolProvider } from '../types/index';
import { extractToolCallsFromMessage } from './index';
import { logger } from './logger';

/**
 * Process tool calls in a message and execute them asynchronously
 *
 * This function extracts tool calls from a message and executes them in a
 * fire-and-forget manner, logging results and errors without blocking the
 * calling code. This matches the pattern used in the @agentic WordPress
 * implementation where tools are side effects.
 *
 * @param message      - The message to process for tool calls
 * @param toolProvider - Optional tool provider to execute tools
 * @return Promise that resolves immediately (tools execute in background)
 */
export async function processToolCallsAsync(
	message: Message,
	toolProvider?: ToolProvider
): Promise< void > {
	if ( ! toolProvider || ! message ) {
		return;
	}

	try {
		const toolCalls = extractToolCallsFromMessage( message );
		if ( toolCalls.length === 0 ) {
			return;
		}

		logger( 'Processing %d tool calls asynchronously', toolCalls.length );

		// Execute all tool calls asynchronously without blocking
		for ( const toolCall of toolCalls ) {
			const { toolCallId, toolId, arguments: args } = toolCall.data;

			// Execute tool without blocking response (fire-and-forget)
			toolProvider
				.executeTool( toolId as string, args )
				.then( ( result ) => {
					logger( 'Tool %s completed: %O', toolId, result );
				} )
				.catch( ( error ) => {
					logger( 'Tool %s failed: %s', toolId, error );
				} );
		}
	} catch ( error ) {
		logger( 'Warning: Failed to process tool calls: %s', error );
	}
}

/**
 * Process tool calls from a task's status message
 *
 * Convenience function that extracts the message from a task's status
 * and processes any tool calls found within it.
 *
 * @param task         - The task containing the status message
 * @param toolProvider - Optional tool provider to execute tools
 * @return Promise that resolves immediately (tools execute in background)
 */
export async function processTaskToolCalls(
	task: Task,
	toolProvider?: ToolProvider
): Promise< void > {
	if ( ! task?.status?.message ) {
		return;
	}

	return processToolCallsAsync( task.status.message, toolProvider );
}

/**
 * Check if a message contains tool calls
 *
 * @param message - The message to check
 * @return True if the message contains tool calls, false otherwise
 */
export function hasToolCalls( message: Message ): boolean {
	if ( ! message || ! message.parts || ! Array.isArray( message.parts ) ) {
		return false;
	}

	const toolCalls = extractToolCallsFromMessage( message );
	return toolCalls.length > 0;
}

/**
 * Get the number of tool calls in a message
 *
 * @param message - The message to analyze
 * @return The number of tool calls found
 */
export function getToolCallCount( message: Message ): number {
	if ( ! message || ! message.parts || ! Array.isArray( message.parts ) ) {
		return 0;
	}

	const toolCalls = extractToolCallsFromMessage( message );
	return toolCalls.length;
}
