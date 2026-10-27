import { useCallback, useRef } from '@wordpress/element';
import {
	getTaskUpdateMessageId,
	getTaskUpdateOutcome,
	isTerminalTaskUpdate,
} from '../utils/task-update';
import { recordAgentsManagerTracksEvent } from '../utils/tracks';
import type { TaskUpdate } from '@automattic/agenttic-client';

/**
 * Records how each agent turn ended, once per turn: a stream can repeat its
 * terminal update.
 */
export function useResponseOutcomeTracking() {
	const reportedTaskIdsRef = useRef( new Set< string >() );

	return useCallback( ( update: TaskUpdate ) => {
		if ( ! isTerminalTaskUpdate( update ) || reportedTaskIdsRef.current.has( update.id ) ) {
			return;
		}

		reportedTaskIdsRef.current.add( update.id );

		const messageId = getTaskUpdateMessageId( update );
		recordAgentsManagerTracksEvent( 'calypso_agents_manager_chat_response_completed', {
			status: getTaskUpdateOutcome( update ),
			...( messageId ? { message_id: messageId } : {} ),
		} );
	}, [] );
}
