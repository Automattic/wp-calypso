import type { MessageAction } from '@automattic/agenttic-ui/dist/types';

// The actions that react to a reply. Anything else (checkpoint status/undo,
// sources, host actions) is always visible wherever its builder put it.
const RESPONSE_ACTION_IDS = new Set( [ 'feedback-up', 'feedback-down', 'copy', 'regenerate' ] );

interface ResponseActionVisibility {
	/** The message belongs to the turn after the user's latest reply. */
	isLatestTurn: boolean;
	/** A reply is still streaming. */
	isStreaming: boolean;
}

/**
 * Decides when a message's response actions are on screen; which actions a
 * message has is never changed here. The turn in progress holds them back
 * until its reply settles, so the row appears at once instead of button by
 * button; a pressed thumb is never held back. Earlier turns keep them as
 * hover-only, which the UI renders as a floating panel that docks into a
 * plain row once a thumb is pressed, so a pressed thumb stays hover-only too
 * and travels with its row.
 */
export function applyResponseActionVisibility(
	actions: MessageAction[],
	{ isLatestTurn, isStreaming }: ResponseActionVisibility
): MessageAction[] {
	if ( isLatestTurn && ! isStreaming ) {
		return actions;
	}

	return actions.flatMap( ( action ) => {
		if ( ! RESPONSE_ACTION_IDS.has( action.id ) ) {
			return [ action ];
		}
		if ( isLatestTurn ) {
			return action.type !== 'component' && action.pressed ? [ action ] : [];
		}
		return [ { ...action, revealOnHover: true } ];
	} );
}
