import type {
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
 * Builds the message that resumes a turn paused on browser tool calls: an
 * `INTERRUPTED_TOOL_RESULT` per pending call, and the calls to add to history,
 * since this page never saw them.
 * @param pending The calls the server reports the turn is waiting on.
 */
export function buildToolCallResume( pending: PendingClientTools ): {
	results: ToolResultInput[];
	turnToolCalls: TurnToolCall[];
} {
	return {
		results: pending.calls.map( ( { toolCallId, toolId } ) => ( {
			toolCallId,
			toolId,
			result: INTERRUPTED_TOOL_RESULT,
		} ) ),
		turnToolCalls: pending.calls.map( ( { toolCallId, toolId, arguments: args } ) => ( {
			toolCallId,
			toolId,
			arguments: args,
		} ) ),
	};
}
