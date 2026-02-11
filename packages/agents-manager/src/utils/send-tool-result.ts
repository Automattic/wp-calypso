/**
 * Utility for sending tool results back to the agent
 *
 * CURRENT LIMITATION:
 * ===================
 * This utility is created as a workaround for a limitation in agenttic-client.
 * When executeAbility() is called for frontend tools, it doesn't receive the
 * toolCallId that's needed to send back a proper tool result.
 *
 * The backend sends Input_Required_Result with tool call information, but
 * executeAbility(name, args) signature doesn't include toolCallId.
 *
 * NEEDED FIX in agenttic-client:
 * ==============================
 * 1. Modify executeAbility signature to: executeAbility(name, args, toolCallId)
 * 2. Automatically send tool result after executeAbility completes
 * 3. For navigation tools: send result FIRST, then navigate
 *
 * Until that fix is implemented, this utility provides manual tool result sending
 * for cases where we can obtain the toolCallId through other means.
 */

import { getAgentManager } from '@automattic/agenttic-client';
import type { Message } from '@automattic/agenttic-client';

// Shape of tool result part (matches ToolResultDataPart in agenttic-client; that type is not exported from the package)
interface ToolResultPart {
	type: 'data';
	data: {
		toolCallId: string;
		toolId: string;
		result?: unknown;
	};
}

/**
 * Send a tool result message to continue a paused workflow
 *
 * When a frontend tool with `frontend_callback: true` is executed,
 * the backend pauses the workflow and expects a tool result to continue.
 *
 * @param agentId - The agent ID
 * @param toolCallId - The tool call ID from the backend
 * @param toolId - The tool/ability name
 * @param result - The result data to send back
 * @param sessionId - Optional session ID
 */
export async function sendToolResult(
	agentId: string,
	toolCallId: string,
	toolId: string,
	result: unknown,
	sessionId?: string
): Promise< void > {
	const manager = getAgentManager();
	const client = manager.getAgent( agentId );

	if ( ! client ) {
		// eslint-disable-next-line no-console
		console.error( `[sendToolResult] No client found for agent: ${ agentId }` );
		return;
	}

	// Create tool result data part
	const toolResultPart: ToolResultPart = {
		type: 'data',
		data: {
			toolCallId,
			toolId,
			result,
		},
	};

	// Create message with tool result
	const message: Message = {
		role: 'user',
		parts: [ toolResultPart ],
		messageId: `tool-result-${ toolCallId }`,
		kind: 'message',
	};

	try {
		// Send the tool result message
		await client.sendMessage( {
			message,
			sessionId,
			withHistory: true,
		} );

		// eslint-disable-next-line no-console
		console.log( `[sendToolResult] Sent tool result for ${ toolId }:`, result );
	} catch ( error ) {
		// eslint-disable-next-line no-console
		console.error( '[sendToolResult] Failed to send tool result:', error );
		throw error;
	}
}

/**
 * Store tool call information for deferred result sending
 * Useful when the action (like navigation) happens before we can send the result
 *
 * @param toolCallId - The tool call ID
 * @param toolId - The tool/ability name
 * @param result - The result to send
 * @param agentId - The agent ID
 * @param sessionId - The session ID
 */
export function storePendingToolResult(
	toolCallId: string,
	toolId: string,
	result: unknown,
	agentId: string,
	sessionId: string
): void {
	const pendingResult = {
		toolCallId,
		toolId,
		result,
		agentId,
		sessionId,
		timestamp: Date.now(),
	};

	try {
		sessionStorage.setItem( 'agentsManager:pendingToolResult', JSON.stringify( pendingResult ) );
	} catch ( error ) {
		// eslint-disable-next-line no-console
		console.error( '[storePendingToolResult] Failed to store pending tool result:', error );
	}
}

/**
 * Send any pending tool results stored from previous page
 * Call this on page load to handle results from navigation tools
 */
export async function sendPendingToolResults(): Promise< void > {
	try {
		const stored = sessionStorage.getItem( 'agentsManager:pendingToolResult' );
		if ( ! stored ) {
			return;
		}

		const pendingResult = JSON.parse( stored );
		sessionStorage.removeItem( 'agentsManager:pendingToolResult' );

		// Check if the result is recent (within last 30 seconds)
		const age = Date.now() - pendingResult.timestamp;
		if ( age > 30000 ) {
			// eslint-disable-next-line no-console
			console.warn( '[sendPendingToolResults] Pending tool result expired, not sending' );
			return;
		}

		await sendToolResult(
			pendingResult.agentId,
			pendingResult.toolCallId,
			pendingResult.toolId,
			pendingResult.result,
			pendingResult.sessionId
		);
	} catch ( error ) {
		// eslint-disable-next-line no-console
		console.error( '[sendPendingToolResults] Failed to send pending tool results:', error );
	}
}
