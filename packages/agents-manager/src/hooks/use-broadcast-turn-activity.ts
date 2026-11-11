import { getAgentManager } from '@automattic/agenttic-client';
import { useEffect } from '@wordpress/element';
import {
	AGENT_TURN_ENDED_EVENT,
	AGENT_TURN_STARTED_EVENT,
	broadcastTurnEvent,
} from '../utils/agent-activity-events';

/**
 * What was last announced, at module scope so it survives the chat unmounting.
 *
 * The turn does not belong to the component: the stream runs on the agent
 * manager singleton, and this chat can unmount and remount around it. A ref
 * would be reset by that remount and the next announcement would repeat or
 * contradict the last one.
 */
let announcedActive = false;

/**
 * Whether a turn is still running, according to the singleton that runs it.
 * @param agentId The chat's agent, absent until its config has loaded.
 * @returns Whether a turn is in flight.
 */
function hasTurnInFlight( agentId: string | undefined ): boolean {
	return Boolean( agentId ) && getAgentManager().isTurnInFlight( agentId as string );
}

/**
 * Announce a change in whether the agent is working.
 * @param isActive Whether a turn is running.
 */
function announce( isActive: boolean ): void {
	if ( isActive === announcedActive ) {
		return;
	}

	announcedActive = isActive;
	broadcastTurnEvent( isActive ? AGENT_TURN_STARTED_EVENT : AGENT_TURN_ENDED_EVENT );
}

/**
 * Broadcast the edges of the agent's turn to code outside the React tree.
 *
 * Edges only, not the state: a listener wants to know when the agent started
 * and stopped acting, and repeating "still processing" on every render would
 * say nothing new.
 *
 * `isProcessing` alone isn't enough: it belongs to this component, and the turn
 * does not. History or closing the panel unmounts the chat while the stream
 * carries on, and announcing the end then would tell a host the agent had
 * stopped while it was still writing.
 *
 * So the manager is asked at every edge, and it has the last word: the turn is
 * over only when it says so. What that cannot cover is a turn finishing while
 * the chat is unmounted — nothing is listening to notice. The end is announced
 * when the chat comes back instead, and until then a listener is told the agent
 * is still working. Deliberately that way round: a host that wrongly believes
 * the agent is busy holds off, while one that wrongly believes it is idle acts
 * over the agent's work.
 * @param agentId      The chat's agent, absent until its config has loaded.
 * @param isProcessing Whether this chat has a turn in flight.
 */
export function useBroadcastTurnActivity(
	agentId: string | undefined,
	isProcessing: boolean
): void {
	useEffect( () => {
		announce( isProcessing || hasTurnInFlight( agentId ) );
	}, [ agentId, isProcessing ] );

	useEffect(
		() => () => {
			announce( hasTurnInFlight( agentId ) );
		},
		[ agentId ]
	);
}
