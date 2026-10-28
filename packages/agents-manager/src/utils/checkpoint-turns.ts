import { getCheckpointIdForMessage } from '../hooks/use-checkpoint-action';
import { isContextOnlyMessage } from './context-only-message';
import { getLatestUserMessageIndex } from './latest-message';
import type { UIMessage } from '@automattic/agenttic-client';

interface CheckpointTurns {
	/** The only checkpoints that can be undone. */
	latestTurnCheckpointIds: Set< string >;
	userMessageIdByCheckpointId: Map< string, string | undefined >;
	latestUserMessageId: string | undefined;
}

/**
 * Groups a transcript's checkpoints by the user turn they answer. Only the
 * latest turn's checkpoints can be undone.
 */
export function getCheckpointTurns(
	messages: UIMessage[],
	getCheckpointMessage: ( message: UIMessage ) => UIMessage
): CheckpointTurns {
	const latestUserMessageIndex = getLatestUserMessageIndex( messages );
	const latestTurnCheckpointIds = new Set< string >();
	const userMessageIdByCheckpointId = new Map< string, string | undefined >();
	let userMessageId: string | undefined;

	messages.forEach( ( message, index ) => {
		if ( message.role === 'user' && ! isContextOnlyMessage( message ) ) {
			userMessageId = message.id;
		}

		const checkpointId = getCheckpointIdForMessage( getCheckpointMessage( message ) );
		if ( ! checkpointId ) {
			return;
		}

		userMessageIdByCheckpointId.set( checkpointId, userMessageId );
		if ( index > latestUserMessageIndex ) {
			latestTurnCheckpointIds.add( checkpointId );
		}
	} );

	return {
		latestTurnCheckpointIds,
		userMessageIdByCheckpointId,
		latestUserMessageId: messages[ latestUserMessageIndex ]?.id,
	};
}
