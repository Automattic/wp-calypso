/**
 * Announces each tool result the stream delivers, so a page whose data a tool
 * may have written can re-read it.
 *
 * Server tools write from the backend, without passing through the browser, so
 * their result in the stream is the page's only signal that it may be stale.
 * Client abilities announce themselves with `agents-manager-ability-completed`.
 *
 * Results reach the stream in two shapes, and both are read: a tool-result data
 * part (`{ toolCallId, result }`) and a tool message, whose text is JSON
 * (`{ tool_id, tool_call_id, data }`).
 */
import { broadcastToolResult, type ToolResultDetail } from './agent-activity-events';
import type { Message, TaskUpdate } from '@automattic/agenttic-client';

/**
 * Tool calls already announced. Status updates repeat the parts they carry, so
 * the same result arrives many times.
 */
const announcedToolCallIds = new Set< string >();

function isRecord( value: unknown ): value is Record< string, unknown > {
	return typeof value === 'object' && value !== null;
}

function toDetail( toolCallId: unknown, toolId: unknown ): ToolResultDetail[] {
	if ( typeof toolCallId !== 'string' || ! toolCallId ) {
		return [];
	}

	return [ { toolCallId, ...( typeof toolId === 'string' && { toolId } ) } ];
}

function parseToolMessage( text: string ): ToolResultDetail[] {
	if ( ! text.startsWith( '{' ) ) {
		return [];
	}

	try {
		const parsed: unknown = JSON.parse( text );
		if ( isRecord( parsed ) ) {
			return toDetail( parsed.tool_call_id, parsed.tool_id );
		}
	} catch {}

	return [];
}

/**
 * The tool results an agent message carries. A `user` message is the client's
 * tool-result echo replaying earlier turns, so it is skipped.
 */
function getToolResults( message: Message | undefined ): ToolResultDetail[] {
	if ( message?.role !== 'agent' || ! Array.isArray( message.parts ) ) {
		return [];
	}

	return message.parts.flatMap( ( part ): ToolResultDetail[] => {
		if ( part.type === 'data' && isRecord( part.data ) && 'result' in part.data ) {
			return toDetail( part.data.toolCallId, part.data.toolId );
		}
		if ( part.type === 'text' && typeof part.text === 'string' ) {
			return parseToolMessage( part.text );
		}
		return [];
	} );
}

/**
 * Announce the tool results in a streamed update that have not been announced yet.
 * @param update The task update, as `onTaskUpdate` receives it.
 */
export function broadcastTaskUpdateToolResults( update: TaskUpdate ): void {
	for ( const message of [ update.status?.message, update.agentMessage ] ) {
		for ( const detail of getToolResults( message ) ) {
			if ( announcedToolCallIds.has( detail.toolCallId ) ) {
				continue;
			}

			announcedToolCallIds.add( detail.toolCallId );
			broadcastToolResult( detail );
		}
	}
}
