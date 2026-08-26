import { useEffect, useRef } from '@wordpress/element';
import {
	AGENT_TURN_ENDED_EVENT,
	AGENT_TURN_STARTED_EVENT,
	broadcastTurnEvent,
} from '../utils/agent-activity-events';

/**
 * Broadcast the edges of the agent's turn to code outside the React tree.
 *
 * Edges only, not the state: a listener wants to know when the agent started
 * and stopped acting, and repeating "still processing" on every render would say
 * nothing new. Mounting mid-turn counts as a start — a listener attaching after
 * the turn began would otherwise read the turn's writes as nobody's — and
 * unmounting mid-turn counts as an end, since the turn goes with the chat.
 * @param isProcessing Whether a turn is in flight.
 */
export function useBroadcastTurnActivity( isProcessing: boolean ): void {
	const wasProcessingRef = useRef( false );

	useEffect( () => {
		if ( isProcessing === wasProcessingRef.current ) {
			return;
		}
		wasProcessingRef.current = isProcessing;
		broadcastTurnEvent( isProcessing ? AGENT_TURN_STARTED_EVENT : AGENT_TURN_ENDED_EVENT );
	}, [ isProcessing ] );

	useEffect(
		() => () => {
			if ( wasProcessingRef.current ) {
				wasProcessingRef.current = false;
				broadcastTurnEvent( AGENT_TURN_ENDED_EVENT );
			}
		},
		[]
	);
}
