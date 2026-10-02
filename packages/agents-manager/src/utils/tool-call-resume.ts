import type {
	Message,
	PendingClientTools,
	ToolResultInput,
	TurnToolCall,
} from '@automattic/agenttic-client';

/**
 * The result a resume sends for a browser tool call whose page went away before
 * it reported back. The outcome is unknown: a read can simply run again, but a
 * write may already have happened, so the assistant must check before repeating it.
 */
export const INTERRUPTED_TOOL_RESULT = {
	success: false,
	error: 'interrupted',
	message:
		'The page changed before this action finished, so its outcome is unknown. Run it again if it is still needed, and check the current state before repeating any change.',
};

/**
 * Builds the message that resumes a turn paused on browser tool calls: one result
 * per pending call (the one the old page stored, else `INTERRUPTED_TOOL_RESULT`),
 * and the calls to add to history when this page never saw them.
 * @param pending       The calls the server reports the turn is waiting on.
 * @param localMessages The tab's stored transcript, read before hydration replaced it.
 */
export function buildToolCallResume(
	pending: PendingClientTools,
	localMessages: Message[]
): { results: ToolResultInput[]; turnToolCalls: TurnToolCall[] } {
	const storedResults = new Map< string, unknown >();
	for ( const message of localMessages ) {
		for ( const part of message.parts ) {
			if ( part.type === 'data' && 'toolCallId' in part.data && 'result' in part.data ) {
				storedResults.set( String( part.data.toolCallId ), part.data.result );
			}
		}
	}

	return {
		results: pending.calls.map( ( { toolCallId, toolId } ) => ( {
			toolCallId,
			toolId,
			result: storedResults.has( toolCallId )
				? storedResults.get( toolCallId )
				: INTERRUPTED_TOOL_RESULT,
		} ) ),
		turnToolCalls: pending.calls.map( ( { toolCallId, toolId, arguments: args } ) => ( {
			toolCallId,
			toolId,
			arguments: args,
		} ) ),
	};
}
