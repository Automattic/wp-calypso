/**
 * Unit tests for Block Notes tracking functions
 *
 * These tests validate that tracking functions call recordTracksEvent
 * with correct event names and essential properties.
 */

// Mock the tracks module
jest.mock( '@automattic/calypso-analytics', () => ( {
	recordTracksEvent: jest.fn(),
} ) );

import { recordTracksEvent } from '@automattic/calypso-analytics';
import {
	trackBlockNoteAiReplyCreated,
	trackBlockNoteAiReplyFailed,
	trackBlockNoteAiResponseFailed,
	trackBlockNoteAtMentionUsed,
} from './tracking';

describe( 'Block Notes Tracking', () => {
	const TEST_POST_ID = 123;
	const TEST_NOTE_ID = 456;
	const TEST_PARENT_NOTE_ID = 789;

	beforeEach( () => {
		jest.clearAllMocks();
	} );

	describe( 'trackBlockNoteAtMentionUsed', () => {
		it( 'should call recordTracksEvent with correct event name and required properties', () => {
			trackBlockNoteAtMentionUsed( {
				postId: TEST_POST_ID,
				noteId: TEST_NOTE_ID,
			} );

			expect( recordTracksEvent ).toHaveBeenCalledWith(
				'block_note_at_mention_used',
				expect.objectContaining( {
					post_id: TEST_POST_ID,
					note_id: TEST_NOTE_ID,
				} )
			);
		} );

		it( 'should include parent_note_id when provided', () => {
			trackBlockNoteAtMentionUsed( {
				postId: TEST_POST_ID,
				noteId: TEST_NOTE_ID,
				parentNoteId: TEST_PARENT_NOTE_ID,
			} );

			expect( recordTracksEvent ).toHaveBeenCalledWith(
				'block_note_at_mention_used',
				expect.objectContaining( {
					post_id: TEST_POST_ID,
					note_id: TEST_NOTE_ID,
					parent_note_id: TEST_PARENT_NOTE_ID,
				} )
			);
		} );
	} );

	describe( 'trackBlockNoteAiReplyCreated', () => {
		it( 'should call recordTracksEvent with correct event name and required properties', () => {
			trackBlockNoteAiReplyCreated( {
				noteId: TEST_NOTE_ID,
				postId: TEST_POST_ID,
			} );

			expect( recordTracksEvent ).toHaveBeenCalledWith(
				'block_note_ai_reply_created',
				expect.objectContaining( {
					note_id: TEST_NOTE_ID,
					post_id: TEST_POST_ID,
				} )
			);
		} );

		it( 'should include parent_note_id when provided', () => {
			trackBlockNoteAiReplyCreated( {
				noteId: TEST_NOTE_ID,
				postId: TEST_POST_ID,
				parentNoteId: TEST_PARENT_NOTE_ID,
			} );

			expect( recordTracksEvent ).toHaveBeenCalledWith(
				'block_note_ai_reply_created',
				expect.objectContaining( {
					note_id: TEST_NOTE_ID,
					post_id: TEST_POST_ID,
					parent_note_id: TEST_PARENT_NOTE_ID,
				} )
			);
		} );
	} );

	describe( 'trackBlockNoteAiResponseFailed', () => {
		it( 'should call recordTracksEvent with correct event name and required properties', () => {
			trackBlockNoteAiResponseFailed( {
				noteId: TEST_NOTE_ID,
				errorType: 'agent_response_failed',
			} );

			expect( recordTracksEvent ).toHaveBeenCalledWith(
				'block_note_ai_response_failed',
				expect.objectContaining( {
					note_id: TEST_NOTE_ID,
					error_type: 'agent_response_failed',
				} )
			);
		} );

		it( 'should include post_id when provided', () => {
			trackBlockNoteAiResponseFailed( {
				noteId: TEST_NOTE_ID,
				postId: TEST_POST_ID,
				errorType: 'agent_response_failed',
			} );

			expect( recordTracksEvent ).toHaveBeenCalledWith(
				'block_note_ai_response_failed',
				expect.objectContaining( {
					note_id: TEST_NOTE_ID,
					post_id: TEST_POST_ID,
					error_type: 'agent_response_failed',
				} )
			);
		} );

		it( 'should include parent_note_id when provided', () => {
			trackBlockNoteAiResponseFailed( {
				noteId: TEST_NOTE_ID,
				postId: TEST_POST_ID,
				parentNoteId: TEST_PARENT_NOTE_ID,
				errorType: 'unknown',
			} );

			expect( recordTracksEvent ).toHaveBeenCalledWith(
				'block_note_ai_response_failed',
				expect.objectContaining( {
					note_id: TEST_NOTE_ID,
					post_id: TEST_POST_ID,
					parent_note_id: TEST_PARENT_NOTE_ID,
					error_type: 'unknown',
				} )
			);
		} );
	} );

	describe( 'trackBlockNoteAiReplyFailed', () => {
		it( 'should call recordTracksEvent with correct event name and required properties', () => {
			trackBlockNoteAiReplyFailed( {
				noteId: TEST_NOTE_ID,
				errorType: 'ability_failed',
			} );

			expect( recordTracksEvent ).toHaveBeenCalledWith(
				'block_note_ai_reply_failed',
				expect.objectContaining( {
					note_id: TEST_NOTE_ID,
					error_type: 'ability_failed',
				} )
			);
		} );

		it( 'should include post_id when provided', () => {
			trackBlockNoteAiReplyFailed( {
				noteId: TEST_NOTE_ID,
				postId: TEST_POST_ID,
				errorType: 'unknown',
			} );

			expect( recordTracksEvent ).toHaveBeenCalledWith(
				'block_note_ai_reply_failed',
				expect.objectContaining( {
					note_id: TEST_NOTE_ID,
					post_id: TEST_POST_ID,
					error_type: 'unknown',
				} )
			);
		} );
	} );
} );
