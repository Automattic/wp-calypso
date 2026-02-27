/**
 * Block Notes Tracking Functions
 *
 * Centralized tracking functions for Block Notes events.
 */

import { recordTracksEvent } from '@automattic/calypso-analytics';

interface TrackBlockNoteAtMentionUsedOptions {
	postId: number;
	noteId: number;
	parentNoteId?: number;
	sessionId?: string;
}

interface TrackBlockNoteAiReplyCreatedOptions {
	postId: number;
	noteId: number;
	parentNoteId?: number;
	sessionId?: string;
}

interface TrackBlockNoteAiResponseFailedOptions {
	noteId: number;
	postId?: number;
	parentNoteId?: number;
	errorType: 'agent_response_failed' | 'unknown';
	sessionId?: string;
}

interface TrackBlockNoteAiReplyFailedOptions {
	noteId: number;
	postId?: number;
	errorType: 'ability_failed' | 'unknown';
	sessionId?: string;
}

/**
 * Tracks mention of `@ai` in a block note
 * @param options              - Tracking options
 * @param options.postId       - Post ID
 * @param options.noteId       - Note ID where at-mention was used
 * @param options.parentNoteId - (optional) Parent note ID
 * @param options.sessionId    - (optional) Thread-specific session ID to override global session
 */
export function trackBlockNoteAtMentionUsed( {
	postId,
	noteId,
	parentNoteId,
	sessionId,
}: TrackBlockNoteAtMentionUsedOptions ): void {
	const properties: Record< string, string | number > = {
		post_id: postId,
		note_id: noteId,
	};
	if ( parentNoteId !== undefined ) {
		properties.parent_note_id = parentNoteId;
	}
	if ( sessionId !== undefined ) {
		properties.sessionid = sessionId;
	}
	recordTracksEvent( 'block_note_at_mention_used', properties );
}

/**
 * Tracks successful creation of an AI-generated reply to a block note
 * @param options              - Tracking options
 * @param options.noteId       - Note ID of the created reply
 * @param options.postId       - Post ID
 * @param options.parentNoteId - (optional) Parent note ID
 * @param options.sessionId    - (optional) Thread-specific session ID to override global session
 */
export function trackBlockNoteAiReplyCreated( {
	noteId,
	postId,
	parentNoteId,
	sessionId,
}: TrackBlockNoteAiReplyCreatedOptions ): void {
	const properties: Record< string, string | number > = {
		note_id: noteId,
		post_id: postId,
	};
	if ( parentNoteId !== undefined ) {
		properties.parent_note_id = parentNoteId;
	}
	if ( sessionId !== undefined ) {
		properties.sessionid = sessionId;
	}
	recordTracksEvent( 'block_note_ai_reply_created', properties );
}

/**
 * Tracks when AI fails to generate a response for a block note
 * @param options              - Tracking options
 * @param options.noteId       - Note ID that was being responded to
 * @param options.postId       - (optional) Post ID
 * @param options.parentNoteId - (optional) Parent note ID
 * @param options.errorType    - Type of error that occurred
 * @param options.sessionId    - (optional) Thread-specific session ID to override global session
 */
export function trackBlockNoteAiResponseFailed( {
	noteId,
	postId,
	parentNoteId,
	errorType,
	sessionId,
}: TrackBlockNoteAiResponseFailedOptions ): void {
	const properties: Record< string, string | number > = {
		note_id: noteId,
		error_type: errorType,
	};
	if ( postId !== undefined ) {
		properties.post_id = postId;
	}
	if ( parentNoteId !== undefined ) {
		properties.parent_note_id = parentNoteId;
	}
	if ( sessionId !== undefined ) {
		properties.sessionid = sessionId;
	}

	recordTracksEvent( 'block_note_ai_response_failed', properties );
}

/**
 * Tracks when AI fails to create a reply for a block note
 * @param options           - Tracking options
 * @param options.noteId    - Note ID that was being replied to
 * @param options.postId    - Post ID if available
 * @param options.errorType - Type of error that occurred
 * @param options.sessionId - (optional) Thread-specific session ID to override global session
 */
export function trackBlockNoteAiReplyFailed( {
	noteId,
	postId,
	errorType,
	sessionId,
}: TrackBlockNoteAiReplyFailedOptions ): void {
	const properties: Record< string, string | number > = {
		note_id: noteId,
		error_type: errorType,
	};

	if ( postId !== undefined ) {
		properties.post_id = postId;
	}

	if ( sessionId !== undefined ) {
		properties.sessionid = sessionId;
	}

	recordTracksEvent( 'block_note_ai_reply_failed', properties );
}
