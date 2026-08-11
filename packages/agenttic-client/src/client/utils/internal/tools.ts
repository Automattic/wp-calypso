import type { Message } from '../../types/index';
import { extractToolCallsFromMessage } from '../core';

/**
 * Check if a message contains tool calls
 *
 * @param message - The message to check
 * @returns True if the message contains tool calls, false otherwise
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
 * @returns The number of tool calls found
 */
export function getToolCallCount( message: Message ): number {
	if ( ! message || ! message.parts || ! Array.isArray( message.parts ) ) {
		return 0;
	}

	const toolCalls = extractToolCallsFromMessage( message );
	return toolCalls.length;
}
