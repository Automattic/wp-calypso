import type { AgentTurnPosition } from './message-turns';
import type { MessageAction } from '@automattic/agenttic-ui/dist/types';

type ResponseActionScope = 'turn' | 'latest-turn' | 'message';

// Response actions the policy governs. Anything else (checkpoint, sources, host
// actions) stays exactly where its builder put it.
const RESPONSE_ACTION_SCOPES: Record< string, ResponseActionScope > = {
	'feedback-up': 'turn',
	'feedback-down': 'turn',
	regenerate: 'latest-turn',
	copy: 'message',
};

/**
 * The one place that decides how response actions behave across turns. Turn
 * actions (thumbs, regenerate) sit on the turn's carrier reply and wait until
 * the latest turn has finished streaming; per-message actions (copy) only hide
 * on the message still being streamed. On earlier turns they render only while
 * the message is hovered or focused. A pressed thumb is never moved or hidden,
 * so a recorded vote survives its turn growing past it. Messages outside an
 * agent turn (user replies, hidden context) are left alone.
 */
export function applyTurnActionPolicy(
	actions: MessageAction[],
	turnPosition: AgentTurnPosition | undefined,
	isStreaming: boolean
): MessageAction[] {
	if ( ! turnPosition ) {
		return actions;
	}

	const { isLatestTurn, isLastInTurn, carriesTurnActions } = turnPosition;
	const isTurnStreaming = isLatestTurn && isStreaming;

	return actions.flatMap( ( action ) => {
		const scope = RESPONSE_ACTION_SCOPES[ action.id ];
		if ( ! scope || ( action.type !== 'component' && action.pressed ) ) {
			return [ action ];
		}
		if ( scope === 'message' ) {
			if ( isTurnStreaming && isLastInTurn ) {
				return [];
			}
		} else if (
			isTurnStreaming ||
			! carriesTurnActions ||
			( ! isLatestTurn && scope === 'latest-turn' )
		) {
			return [];
		}
		return [ isLatestTurn ? action : { ...action, revealOnHover: true } ];
	} );
}
