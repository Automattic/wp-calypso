import { isContextOnlyMessage } from './context-only-message';
import type { UIMessage } from '@automattic/agenttic-client';

export interface AgentTurnPosition {
	/** No user reply follows this turn yet. */
	isLatestTurn: boolean;
	/** Last rendered agent message of the turn, where a streaming reply lands. */
	isLastInTurn: boolean;
	/** Carries the turn's rating: the turn's last text reply the caller did not veto. */
	carriesTurnActions: boolean;
}

export interface TurnPositionOptions< T extends UIMessage > {
	/** Veto for replies that must not carry turn-level actions (disabled, UI-only notices). */
	canCarryTurnActions?: ( message: T ) => boolean;
	/** A reply already holding turn-level state (a recorded vote) stays the carrier as its turn grows. */
	hasTurnActions?: ( message: T ) => boolean;
}

function isUserReply( message: UIMessage ): boolean {
	return message.role === 'user' && ! isContextOnlyMessage( message );
}

// Mirrors agenttic-ui's getVisibleMessages: context/data-only messages never render.
function isRenderedAgentMessage( message: UIMessage ): boolean {
	return (
		message.role === 'agent' &&
		Boolean( message.content?.some( ( part ) => part.type !== 'context' && part.type !== 'data' ) )
	);
}

// A reply the agent wrote, as opposed to a tool card, picker or other component it surfaced.
function isTextReply( message: UIMessage ): boolean {
	const parts = message.content ?? [];
	return (
		parts.some( ( part ) => part.type === 'text' && Boolean( part.text?.trim() ) ) &&
		! parts.some( ( part ) => part.type === 'component' )
	);
}

/**
 * Places each rendered agent message in its turn: the run of agent messages
 * between two user replies. Hidden context messages (navigation continuations)
 * are not replies, so they do not start a new turn. Turn-level actions such as
 * the rating go on the turn's carrier: the reply that already holds a vote, or
 * else its last text reply, so they never land on a picker or a disabled
 * message; the latest turn is the one the user has not replied to yet.
 */
export function getAgentTurnPositions< T extends UIMessage >(
	messages: T[],
	{ canCarryTurnActions = () => true, hasTurnActions = () => false }: TurnPositionOptions< T > = {}
): Map< string, AgentTurnPosition > {
	const turns: T[][] = [ [] ];
	for ( const message of messages ) {
		if ( isUserReply( message ) ) {
			turns.push( [] );
		} else if ( isRenderedAgentMessage( message ) ) {
			turns[ turns.length - 1 ].push( message );
		}
	}

	const positions = new Map< string, AgentTurnPosition >();
	turns.forEach( ( turn, turnIndex ) => {
		const isLatestTurn = turnIndex === turns.length - 1;
		const carrier =
			turn.find( hasTurnActions ) ??
			[ ...turn ]
				.reverse()
				.find( ( message ) => isTextReply( message ) && canCarryTurnActions( message ) );

		turn.forEach( ( message, index ) => {
			positions.set( message.id, {
				isLatestTurn,
				isLastInTurn: index === turn.length - 1,
				carriesTurnActions: message === carrier,
			} );
		} );
	} );

	return positions;
}
