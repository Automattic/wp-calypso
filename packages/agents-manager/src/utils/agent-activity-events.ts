/**
 * Window events that tell code outside the React tree what the agent is doing.
 *
 * Hosts that render their own editing surface around the chat (Big Sky's easy
 * mode) need two things they cannot see from outside: whether a turn is in
 * flight, and when an ability has finished writing. Easy mode holds its own
 * navigation while the agent works, shows what changed once the turn ends, and
 * follows an ability that moves the editor.
 *
 * Same channel as `agents-manager-ready` and `agents-manager-conversation-changed`:
 * a window event, because the listeners are other bundles.
 */

/** A turn began: the user sent a message and the agent is working on it. */
export const AGENT_TURN_STARTED_EVENT = 'agents-manager-turn-started';

/** The turn finished or was aborted. */
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
 * A server tool's result arrived in the stream, so whatever it wrote has landed.
 * Server tools write without passing through the browser, so this is the only
 * word a page gets that data it renders may be stale.
 */
export const TOOL_RESULT_EVENT = 'agents-manager-tool-result';

/** What `TOOL_RESULT_EVENT` carries in `detail`. */
export type ToolResultDetail = {
	toolCallId: string;
	/** The tool's id, e.g. `wpcom__site_settings_update`, when the stream carries it. */
	toolId?: string;
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

/**
 * Broadcast that a server tool's result arrived.
 * @param detail Which tool call.
 */
export function broadcastToolResult( detail: ToolResultDetail ): void {
	window.dispatchEvent( new CustomEvent( TOOL_RESULT_EVENT, { detail } ) );
}
