import { useCallback, useLayoutEffect, useRef } from '@wordpress/element';
import { useAgentsManagerContext } from '../contexts';
import { isSessionBootstrap } from '../utils/agent-session';
import {
	getAgentToolCallIds,
	getBlockEditAgentMessageText,
	getTaskUpdateMessageId,
	isSuccessfulTaskUpdate,
	isTerminalTaskUpdate,
} from '../utils/task-update';
import { getCheckpointIdForMessage, invalidateCheckpointAction } from './use-checkpoint-action';
import type { Message, TaskUpdate, UIMessage } from '@automattic/agenttic-client';

interface StreamedCheckpointState {
	scopeIdentity: string;
	sessionId: string;
	sessionIdentity: string;
	/** Changes with every session switch except a new chat's bootstrap (`isSessionBootstrap()`). */
	streamGeneration: symbol;
	pendingByTaskId: Map< string, UIMessage >;
	toolCallIdsByTaskId: Map< string, Set< string > >;
	byFinalMessageId: Map< string, UIMessage >;
	/** Final messages streamed in this page load, whose checkpoints are still live. */
	liveFinalMessageIds: Set< string >;
	regeneratingMessageId?: string;
}

// Module-level so a remount (History and back, reopening the panel) keeps the
// streamed messages of the session it returns to.
const streamedCheckpointMessagesBySession = new Map< string, Map< string, UIMessage > >();
let activeStreamedCheckpointSession:
	| Pick<
			StreamedCheckpointState,
			'scopeIdentity' | 'sessionId' | 'sessionIdentity' | 'liveFinalMessageIds'
	  >
	| undefined;

function getStreamedCheckpointMessages( sessionIdentity: string ): Map< string, UIMessage > {
	const existing = streamedCheckpointMessagesBySession.get( sessionIdentity );
	if ( existing ) {
		return existing;
	}

	const messages = new Map< string, UIMessage >();
	streamedCheckpointMessagesBySession.set( sessionIdentity, messages );
	return messages;
}

function getLiveStreamedCheckpointMessageIds( sessionIdentity: string ): Set< string > {
	return activeStreamedCheckpointSession?.sessionIdentity === sessionIdentity
		? activeStreamedCheckpointSession.liveFinalMessageIds
		: new Set< string >();
}

/**
 * Publishes which session's ids are live, so a remount on the same session (or
 * its bootstrap) keeps them and any other session starts empty.
 */
function activateLiveStreamedCheckpointSession(
	scopeIdentity: string,
	sessionId: string,
	sessionIdentity: string,
	liveFinalMessageIds: Set< string >
): Set< string > {
	const previousSession = activeStreamedCheckpointSession;
	if ( previousSession?.sessionIdentity === sessionIdentity ) {
		return previousSession.liveFinalMessageIds;
	}

	const nextLiveFinalMessageIds =
		previousSession && isSessionBootstrap( previousSession, { scopeIdentity, sessionId } )
			? previousSession.liveFinalMessageIds
			: liveFinalMessageIds;

	activeStreamedCheckpointSession = {
		scopeIdentity,
		sessionId,
		sessionIdentity,
		liveFinalMessageIds: nextLiveFinalMessageIds,
	};
	return nextLiveFinalMessageIds;
}

/**
 * Moves the state to another session. A new chat's bootstrap
 * (`isSessionBootstrap()`) is the same conversation, so it carries everything
 * over; any other switch starts a new stream generation but keeps the target
 * session's stored streamed messages.
 */
function switchStreamedCheckpointSession(
	previous: StreamedCheckpointState,
	scopeIdentity: string,
	sessionId: string,
	sessionIdentity: string,
	liveFinalMessageIds: Set< string >
): StreamedCheckpointState {
	const byFinalMessageId = getStreamedCheckpointMessages( sessionIdentity );

	if ( ! isSessionBootstrap( previous, { scopeIdentity, sessionId } ) ) {
		return {
			scopeIdentity,
			sessionId,
			sessionIdentity,
			streamGeneration: Symbol(),
			pendingByTaskId: new Map(),
			toolCallIdsByTaskId: new Map(),
			byFinalMessageId,
			liveFinalMessageIds,
		};
	}

	previous.byFinalMessageId.forEach( ( message, messageId ) => {
		if ( ! byFinalMessageId.has( messageId ) ) {
			byFinalMessageId.set( messageId, message );
		}
	} );

	if (
		streamedCheckpointMessagesBySession.get( previous.sessionIdentity ) ===
		previous.byFinalMessageId
	) {
		streamedCheckpointMessagesBySession.delete( previous.sessionIdentity );
	}

	return { ...previous, scopeIdentity, sessionId, sessionIdentity, byFinalMessageId };
}

/**
 * Keeps the block-edit tool message behind each streamed reply, so the reply's
 * checkpoint (Undo) stays bound to it. Only the stream carries the tool result;
 * the final prose that replaces it and the server transcript don't.
 *
 * Messages are keyed by session. Only those streamed in this page load are live:
 * a checkpoint from an earlier load can't be undone. Also returns the session's
 * scope and ID, so other per-session state can follow the same sessions.
 */
export function useStreamedCheckpointMessages() {
	const { agentConfig, getTabSessionId, siteKey, currentUser } = useAgentsManagerContext();
	const userId = currentUser?.ID ?? null;
	const agentId = agentConfig?.agentId ?? '';
	const sessionId = agentConfig?.sessionId ?? getTabSessionId() ?? '';
	const scopeIdentity = JSON.stringify( [ siteKey, userId, agentId ] );
	const sessionIdentity = JSON.stringify( [ siteKey, userId, agentId, sessionId ] );
	const liveFinalMessageIds = getLiveStreamedCheckpointMessageIds( sessionIdentity );

	const stateRef = useRef< StreamedCheckpointState >( {
		scopeIdentity,
		sessionId,
		sessionIdentity,
		streamGeneration: Symbol(),
		pendingByTaskId: new Map(),
		toolCallIdsByTaskId: new Map(),
		byFinalMessageId: getStreamedCheckpointMessages( sessionIdentity ),
		liveFinalMessageIds,
	} );

	// Switched during render, so this render already reads the new session.
	if ( stateRef.current.sessionIdentity !== sessionIdentity ) {
		stateRef.current = switchStreamedCheckpointSession(
			stateRef.current,
			scopeIdentity,
			sessionId,
			sessionIdentity,
			liveFinalMessageIds
		);
	}

	useLayoutEffect( () => {
		stateRef.current.liveFinalMessageIds = activateLiveStreamedCheckpointSession(
			scopeIdentity,
			sessionId,
			sessionIdentity,
			stateRef.current.liveFinalMessageIds
		);
	}, [ scopeIdentity, sessionId, sessionIdentity ] );

	const isCurrentStreamGeneration = useCallback(
		( streamGeneration: symbol ) => stateRef.current.streamGeneration === streamGeneration,
		[]
	);

	// The caller drops updates from an earlier stream generation.
	const recordTaskUpdate = useCallback( ( update: TaskUpdate ) => {
		const state = stateRef.current;

		const agentToolCallIds = getAgentToolCallIds( update );
		if ( agentToolCallIds.length > 0 ) {
			const taskToolCallIds = state.toolCallIdsByTaskId.get( update.id ) ?? new Set();
			agentToolCallIds.forEach( ( toolCallId ) => taskToolCallIds.add( toolCallId ) );
			state.toolCallIdsByTaskId.set( update.id, taskToolCallIds );
		}

		const blockEditAgentMessageText = getBlockEditAgentMessageText(
			update,
			state.toolCallIdsByTaskId.get( update.id )
		);
		if ( blockEditAgentMessageText ) {
			state.pendingByTaskId.set( update.id, {
				id: getTaskUpdateMessageId( update ) ?? update.id,
				role: 'agent',
				content: [ { type: 'text', text: blockEditAgentMessageText } ],
				timestamp: Date.now(),
				archived: false,
				showIcon: true,
			} );
		}

		if ( ! isTerminalTaskUpdate( update ) ) {
			return;
		}

		const finalMessageId = getTaskUpdateMessageId( update );
		const isSuccessful = isSuccessfulTaskUpdate( update );
		const checkpointMessage = state.pendingByTaskId.get( update.id );
		const { regeneratingMessageId } = state;

		// A successful regeneration replaces the reply it regenerated.
		if ( isSuccessful && regeneratingMessageId ) {
			state.byFinalMessageId.delete( regeneratingMessageId );
			state.liveFinalMessageIds.delete( regeneratingMessageId );
		}

		if ( finalMessageId && isSuccessful && checkpointMessage ) {
			state.byFinalMessageId.set( finalMessageId, checkpointMessage );
			state.liveFinalMessageIds.add( finalMessageId );
		} else if ( finalMessageId && isSuccessful && regeneratingMessageId ) {
			state.byFinalMessageId.delete( finalMessageId );
			state.liveFinalMessageIds.delete( finalMessageId );
		}

		state.pendingByTaskId.delete( update.id );
		state.toolCallIdsByTaskId.delete( update.id );
		state.regeneratingMessageId = undefined;
	}, [] );

	const startCheckpointRegeneration = useCallback( ( messageId: string | undefined ) => {
		stateRef.current.pendingByTaskId.clear();
		stateRef.current.toolCallIdsByTaskId.clear();
		stateRef.current.regeneratingMessageId = messageId;
	}, [] );

	const finishCheckpointRegeneration = useCallback( () => {
		stateRef.current.regeneratingMessageId = undefined;
	}, [] );

	// The streamed message behind a message, which carries its checkpoint. A new
	// identity per session (the `void` below) tells memoized callers it changed.
	const getCheckpointMessage = useCallback(
		( message: UIMessage ): UIMessage => {
			void sessionIdentity;
			return stateRef.current.byFinalMessageId.get( message.id ) ?? message;
		},
		[ sessionIdentity ]
	);

	// Invalidates the checkpoints in a loaded transcript that weren't streamed in this page load.
	const invalidateLoadedCheckpoints = useCallback( ( loadedMessages: Message[] ) => {
		const { byFinalMessageId, liveFinalMessageIds } = stateRef.current;

		loadedMessages.forEach( ( message ) => {
			const checkpointMessage = byFinalMessageId.get( message.messageId ) ?? {
				id: message.messageId,
				role: message.role,
				content: message.parts
					.filter( ( part ) => part.type === 'text' )
					.map( ( part ) => ( { type: 'text', text: part.text } ) ),
			};
			const checkpointId = getCheckpointIdForMessage( checkpointMessage );
			if ( checkpointId && ! liveFinalMessageIds.has( message.messageId ) ) {
				invalidateCheckpointAction( checkpointId );
			}
		} );
	}, [] );

	return {
		scopeIdentity,
		sessionId,
		streamGeneration: stateRef.current.streamGeneration,
		isCurrentStreamGeneration,
		recordTaskUpdate,
		startCheckpointRegeneration,
		finishCheckpointRegeneration,
		getCheckpointMessage,
		invalidateLoadedCheckpoints,
	};
}
