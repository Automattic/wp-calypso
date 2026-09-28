/**
 * Window events that tell code outside the React tree what the agent is doing.
 *
 * Hosts that render their own editing surface around the chat (Big Sky's easy
 * mode) need two things they cannot see from outside: whether a turn is in
 * flight, and when an ability has finished writing. Without them, the only
 * signal left is the editor's own dirty state, which blocks also change on
 * mount — so a page opening reads the same as an agent editing it.
 *
 * Same channel as `agents-manager-ready` and `agents-manager-conversation-changed`:
 * a window event, because the listeners are other bundles.
 */

/** A turn began: the user sent a message and the agent is working on it. */
export const AGENT_TURN_STARTED_EVENT = 'agents-manager-turn-started';

/** The turn finished, was aborted, or the chat unmounted with it open. */
export const AGENT_TURN_ENDED_EVENT = 'agents-manager-turn-ended';

/**
 * An ability ran to completion. Fired after it resolved (or threw), so anything
 * it wrote has landed by the time a listener hears about it.
 */
export const ABILITY_COMPLETED_EVENT = 'agents-manager-ability-completed';

/** What `ABILITY_COMPLETED_EVENT` carries in `detail`. */
export type AbilityCompletedDetail = {
	/** The ability name as it was invoked, in either form. */
	name: string;
	/** False when the ability answered `success: false` or threw. */
	ok: boolean;
};

/**
 * Broadcast one of the turn events.
 * @param eventName Which one.
 */
export function broadcastTurnEvent(
	eventName: typeof AGENT_TURN_STARTED_EVENT | typeof AGENT_TURN_ENDED_EVENT
): void {
	window.dispatchEvent( new CustomEvent( eventName ) );
}

/**
 * Broadcast that an ability has finished.
 * @param detail What finished, and how.
 */
export function broadcastAbilityCompleted( detail: AbilityCompletedDetail ): void {
	window.dispatchEvent( new CustomEvent( ABILITY_COMPLETED_EVENT, { detail } ) );
}
