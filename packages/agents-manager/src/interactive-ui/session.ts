import { isSessionBootstrap } from '../utils/agent-session';
import type { InteractiveUiBatch } from './messages';
import type { InteractiveUiRuntime } from '@automattic/ai-ui-renderer';

/** Where a chat session's history ends, so its surfaces can be told apart from new ones. */
interface InteractiveUiHistory {
	/** The signatures of batches restored from history, such as a past chat's. */
	restoredSignatures: Set< string >;
	hasBeenIdle: boolean;
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
		history: { restoredSignatures: new Set(), hasBeenIdle: false, hasStartedTurn: false },
	};
}

/** Disposes of a session's runtime and forgets the batches it applied, so they apply again. */
export function disposeInteractiveUiRuntime( session: InteractiveUiSession ) {
	session.runtime?.dispose();
	session.runtime = undefined;
	session.appliedBatches = [];
}

/**
 * Records the batches restored from history: those in the transcript before the session's first
 * turn, which starts when the agent begins a reply. Right after a switch, the previous
 * conversation's reply can still be in progress, so only a reply begun once the session has been
 * idle counts.
 */
export function trackInteractiveUiHistory(
	history: InteractiveUiHistory,
	{ isProcessing, batches }: { isProcessing: boolean; batches: InteractiveUiBatch[] }
) {
	if ( history.hasStartedTurn ) {
		return;
	}

	if ( ! isProcessing ) {
		history.hasBeenIdle = true;
		batches.forEach( ( batch ) => history.restoredSignatures.add( batch.signature ) );
	} else if ( history.hasBeenIdle ) {
		history.hasStartedTurn = true;
	}
}
