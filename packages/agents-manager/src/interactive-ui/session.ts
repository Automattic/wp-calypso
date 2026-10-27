import { isSessionBootstrap } from '../utils/agent-session';
import { getLatestUserMessageIndex } from '../utils/latest-message';
import {
	getStaleInteractiveUiSurfaceIds,
	getUsableInteractiveUiSurfaceIds,
	keepInteractiveUiSurfacesInTranscript,
} from './messages';
import type { AppliedInteractiveUiBatch, InteractiveUiBatch } from './messages';
import type { UIMessage } from '@automattic/agenttic-client';
import type { InteractiveUiDataModel, InteractiveUiRuntime } from '@automattic/ai-ui-renderer';

/** Where a chat session's history ends, so its surfaces can be told apart from new ones. */
interface InteractiveUiHistory {
	/** The messages restored from history, such as a past chat's, whose batches are restored. */
	restoredMessageIds: Set< string >;
	hasBeenIdle: boolean;
	hasStartedTurn: boolean;
}

/** The interactive UI of the conversation the chat shows. */
export interface InteractiveUiSession {
	/** The site, user and agent the conversation belongs to. */
	scopeIdentity: string;
	sessionId: string;
	runtime?: InteractiveUiRuntime;
	appliedBatches: AppliedInteractiveUiBatch[];
	history: InteractiveUiHistory;
	/**
	 * The errors reported, by owner, surface, code and message, so a rebuild or retry doesn't report
	 * one again.
	 */
	reportedErrorKeys: Set< string >;
	/** The surfaces recorded as rendered, so a rebuild doesn't record one again. */
	renderedSurfaceIds: Set< string >;
	/**
	 * The surfaces whose data the next message sends: those the user can use while the agent is idle.
	 * A turn started by a prompt, regenerated or not, sends those that weren't stale before it, minus
	 * those of a message that left the transcript.
	 */
	usableSurfaceIds: string[];
}

// The session of the conversation the chat shows, whose surfaces' data its messages send. Set
// only while a chat shows it: cleared when the chat unmounts or shows another conversation.
let shownSession: InteractiveUiSession | undefined;

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
		history: { restoredMessageIds: new Set(), hasBeenIdle: false, hasStartedTurn: false },
		reportedErrorKeys: new Set(),
		renderedSurfaceIds: new Set(),
		usableSurfaceIds: [],
	};
}

/**
 * Makes a session the one whose surfaces' data the chat's messages send, and returns a function
 * that stops it, unless another session has replaced it.
 */
export function showInteractiveUiSession( session: InteractiveUiSession ) {
	shownSession = session;

	return () => {
		if ( shownSession === session ) {
			shownSession = undefined;
		}
	};
}

interface UsableInteractiveUiSurfaceOptions {
	isBusy: boolean;
	/** The agent has just begun a reply. */
	isTurnStart: boolean;
	messages: UIMessage[];
	messageIndexes: ReadonlyMap< string, number >;
	latestUserMessageIndex: number;
	staleSurfaceIds: ReadonlySet< string >;
	currentPostId?: number | string;
}

/** A session's next `usableSurfaceIds`, by the rule its doc describes. */
export function getInteractiveUiSessionUsableSurfaceIds(
	{ runtime, appliedBatches, usableSurfaceIds, history }: InteractiveUiSession,
	{
		isBusy,
		isTurnStart,
		messages,
		messageIndexes,
		latestUserMessageIndex,
		staleSurfaceIds,
		currentPostId,
	}: UsableInteractiveUiSurfaceOptions
): string[] {
	if ( ! runtime ) {
		return [];
	}

	if ( ! isBusy ) {
		return getUsableInteractiveUiSurfaceIds( runtime, appliedBatches, staleSurfaceIds );
	}

	// A turn's prompt, regenerated or not, is the last message as the turn starts, and the turn sends
	// the surfaces that weren't stale before it. It's found by position, as Agenttic can change a
	// message's ID.
	if ( isTurnStart && latestUserMessageIndex === messages.length - 1 ) {
		const staleBeforePrompt = getStaleInteractiveUiSurfaceIds( appliedBatches, {
			messageIndexes,
			latestUserMessageIndex: getLatestUserMessageIndex( messages.slice( 0, -1 ) ),
			restoredMessageIds: history.restoredMessageIds,
			currentPostId,
		} );

		return getUsableInteractiveUiSurfaceIds( runtime, appliedBatches, staleBeforePrompt );
	}

	return keepInteractiveUiSurfacesInTranscript( usableSurfaceIds, appliedBatches, messageIndexes );
}

/**
 * A2UI's `a2uiRendererDataModel` for a message to the agent, for the shown session: the data of its
 * surfaces that the user could use before sending it, for those that set `sendDataModel`. It's
 * `undefined` when there's none, and it never throws, as Agenttic would then drop all of the
 * message's metadata, the renderer capabilities included.
 */
export function getShownInteractiveUiDataModel(): InteractiveUiDataModel | undefined {
	try {
		return shownSession?.runtime?.getDataModel( shownSession.usableSurfaceIds );
	} catch ( error ) {
		// eslint-disable-next-line no-console
		console.error( '[AgentsManager] Failed to read the interactive UI data:', error );

		return undefined;
	}
}

/** Disposes of a session's runtime and forgets the batches it applied, so they apply again. */
export function disposeInteractiveUiRuntime( session: InteractiveUiSession ) {
	session.runtime?.dispose();
	session.runtime = undefined;
	session.appliedBatches = [];
}

/**
 * Records the messages restored from history: those with batches in the transcript before the
 * session's first turn, which starts when the agent begins a reply. Right after a switch, the
 * previous conversation's reply can still be in progress, so only a reply begun once the session
 * has been idle counts.
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
		batches.forEach( ( batch ) => history.restoredMessageIds.add( batch.messageId ) );
	} else if ( history.hasBeenIdle ) {
		history.hasStartedTurn = true;
	}
}
