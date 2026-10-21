import { isSessionBootstrap } from './agent-session';
import type { InteractiveUiBatch } from './interactive-ui-messages';
import type { InteractiveUiRuntime } from '@automattic/ai-ui-renderer';

/** Where a chat session's history ends, so its surfaces can be told apart from new ones. */
interface InteractiveUiHistory {
	/** The signatures of batches restored from history, such as a past chat's. */
	restoredSignatures: Set< string >;
	/** The transcript's length when the session was last idle, once it has been. */
	idleMessageCount?: number;
	hasStartedTurn: boolean;
}

/** The interactive UI of the conversation the chat shows. */
export interface InteractiveUiSession {
	/** The site, user and agent the conversation belongs to. */
	scopeIdentity: string;
	sessionId: string;
	runtime?: InteractiveUiRuntime;
	appliedBatches: InteractiveUiBatch[];
	history: InteractiveUiHistory;
}

/**
 * The session for a conversation: the current one while the chat shows the same conversation,
 * including a new chat's bootstrap, when it gets its session ID during its first reply, and a new
 * one on any other switch, a return to an earlier conversation included.
 */
export function getInteractiveUiSession(
	current: InteractiveUiSession | undefined,
	scopeIdentity: string,
	sessionId: string
): InteractiveUiSession {
	const next = { scopeIdentity, sessionId };

	if ( current?.scopeIdentity === scopeIdentity && current.sessionId === sessionId ) {
		return current;
	}

	if ( current && isSessionBootstrap( current, next ) ) {
		current.sessionId = sessionId;
		return current;
	}

	return {
		...next,
		appliedBatches: [],
		history: { restoredSignatures: new Set(), hasStartedTurn: false },
	};
}

/**
 * Records the batches restored from history: those in the transcript before the session's first
 * turn. A turn starts only when the transcript changes while processing, so neither an image
 * upload the user cancels nor the previous conversation's reply, still in progress right after a
 * switch, counts as one.
 */
export function trackInteractiveUiHistory(
	history: InteractiveUiHistory,
	{
		isProcessing,
		messageCount,
		batches,
	}: { isProcessing: boolean; messageCount: number; batches: InteractiveUiBatch[] }
) {
	if ( history.hasStartedTurn ) {
		return;
	}

	if ( ! isProcessing ) {
		history.idleMessageCount = messageCount;
		batches.forEach( ( batch ) => history.restoredSignatures.add( batch.signature ) );
	} else if (
		history.idleMessageCount !== undefined &&
		messageCount !== history.idleMessageCount
	) {
		history.hasStartedTurn = true;
	}
}
