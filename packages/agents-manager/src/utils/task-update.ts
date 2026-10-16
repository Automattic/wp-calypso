import {
	extractToolCallsFromMessage,
	type TaskState,
	type TaskUpdate,
} from '@automattic/agenttic-client';
import { isRecord } from './is-record';
import { isBlockEditToolId, parseToolMessageText } from './tool-message-utils';

type UnsuccessfulTaskState = Extract< TaskState, 'canceled' | 'failed' >;

function isUnsuccessfulTaskState( state: TaskState ): state is UnsuccessfulTaskState {
	return state === 'canceled' || state === 'failed';
}

/** Whether a task update ends its turn. */
export function isTerminalTaskUpdate( update: TaskUpdate ): boolean {
	const { state } = update.status;
	return update.final === true || state === 'completed' || isUnsuccessfulTaskState( state );
}

/** Whether a task update ends its turn with a reply, rather than a stop or an error. */
export function isSuccessfulTaskUpdate( update: TaskUpdate ): boolean {
	const { state } = update.status;
	return state === 'completed' || ( update.final === true && ! isUnsuccessfulTaskState( state ) );
}

/** How a terminal task update ended. */
export function getTaskUpdateOutcome( update: TaskUpdate ): UnsuccessfulTaskState | 'completed' {
	const { state } = update.status;
	return isUnsuccessfulTaskState( state ) ? state : 'completed';
}

/** The id of the agent message a task update carries, if any. */
export function getTaskUpdateMessageId( update: TaskUpdate ): string | undefined {
	return update.status.message?.messageId ?? update.agentMessage?.messageId;
}

/**
 * Ids of the agent's tool calls in a task update. The tool-result echo is the
 * client's own `user` message replaying history, so its tool calls belong to
 * earlier turns and are skipped.
 */
export function getAgentToolCallIds( update: TaskUpdate ): string[] {
	const message = update.status.message;
	if ( message?.role !== 'agent' ) {
		return [];
	}

	return extractToolCallsFromMessage( message ).map( ( toolCall ) => toolCall.data.toolCallId );
}

/**
 * The latest block-edit `agentMessage` a task update carries. Reads tool
 * results only for the task's own tool calls, since the tool-result echo
 * replays block edits from earlier turns.
 */
export function getBlockEditAgentMessageText(
	update: TaskUpdate,
	taskToolCallIds: ReadonlySet< string > | undefined
): string | undefined {
	const candidateTexts = update.text ? [ update.text ] : [];

	for ( const message of [ update.status.message, update.agentMessage ] ) {
		for ( const part of message?.parts ?? [] ) {
			if ( part.type !== 'data' || ! isRecord( part.data ) || ! ( 'result' in part.data ) ) {
				continue;
			}

			const { toolCallId, result } = part.data;
			if ( typeof toolCallId !== 'string' || ! taskToolCallIds?.has( toolCallId ) ) {
				continue;
			}

			if ( isRecord( result ) && typeof result.agentMessage === 'string' ) {
				candidateTexts.push( result.agentMessage );
			}
		}
	}

	for ( let index = candidateTexts.length - 1; index >= 0; index-- ) {
		if ( isBlockEditToolId( parseToolMessageText( candidateTexts[ index ] )?.toolId ) ) {
			return candidateTexts[ index ];
		}
	}

	return undefined;
}
