/**
 * Unit tests for block-notes ability registration and callback
 *
 * Tests cover critical paths:
 * 1. Ability registration (success, duplicate prevention)
 * 2. Get operation (success, validation)
 * 3. Reply operation (success, validation, tracking)
 * 4. Error handling
 */

import { registerAbility, registerAbilityCategory } from '@wordpress/abilities';
import * as tracking from '../utils/tracking';
import * as utils from './utils';
import { ABILITY_NAME, type BlockNotesCallback, registerBlockNotesAbility } from './index';

// Create mock functions for WordPress APIs
const mockGetCurrentPostId = jest.fn();

// Mock WordPress dependencies
jest.mock( '@wordpress/data', () => ( {
	select: jest.fn( ( storeName ) => {
		if ( storeName === 'core/editor' ) {
			return {
				getCurrentPostId: mockGetCurrentPostId,
			};
		}
		return {};
	} ),
} ) );

jest.mock( '@wordpress/editor', () => ( {
	store: 'core/editor',
} ) );

jest.mock( '@wordpress/abilities', () => ( {
	registerAbility: jest.fn(),
	registerAbilityCategory: jest.fn(),
} ) );

jest.mock( '@wordpress/core-data', () => ( {
	store: 'core',
} ) );

jest.mock( '../utils/tracking', () => ( {
	trackBlockNoteAiReplyCreated: jest.fn(),
	trackBlockNoteAiReplyFailed: jest.fn(),
} ) );

jest.mock( '../utils/session', () => ( {
	getBlockNoteThreadSessionId: jest.fn( () => Promise.resolve( 'test-session-id' ) ),
} ) );

describe( 'Block Notes Ability', () => {
	const TEST_POST_ID = 123;
	const TEST_BLOCK_NOTE_ID = 456;
	const TEST_REPLY_TEXT = 'This is a test reply';

	let mockCallback: BlockNotesCallback;
	let consoleErrorSpy: jest.SpyInstance;

	beforeEach( () => {
		jest.clearAllMocks();
		consoleErrorSpy = jest.spyOn( console, 'error' ).mockImplementation( () => {} );

		// Setup default mock return value for getCurrentPostId
		mockGetCurrentPostId.mockReturnValue( TEST_POST_ID );

		// Mock registerAbility to capture the callback
		( registerAbility as jest.Mock ).mockImplementation( ( config: any ) => {
			mockCallback = config.callback;
			return Promise.resolve();
		} );
	} );

	afterEach( () => {
		jest.restoreAllMocks();
	} );

	describe( 'registerBlockNotesAbility', () => {
		it( 'should register ability successfully on first call', async () => {
			await registerBlockNotesAbility();

			expect( registerAbilityCategory ).toHaveBeenCalledWith( 'big-sky', {
				label: 'Big Sky',
				description: 'Big Sky abilities for WordPress',
			} );
			expect( registerAbility ).toHaveBeenCalledWith(
				expect.objectContaining( {
					name: ABILITY_NAME,
					label: 'Block Notes',
					category: 'big-sky',
					description: expect.stringContaining( 'Ability to view and reply to notes' ),
					input_schema: expect.objectContaining( {
						type: 'object',
						properties: expect.any( Object ),
						required: [ 'operation', 'blockNoteId' ],
					} ),
					callback: expect.any( Function ),
				} )
			);
		} );

		it( 'should prevent duplicate registration within same session', async () => {
			// First registration
			await registerBlockNotesAbility();
			const firstCallCount = ( registerAbility as jest.Mock ).mock.calls.length;

			// Second registration attempt - should not call registerAbility again
			await registerBlockNotesAbility();
			const secondCallCount = ( registerAbility as jest.Mock ).mock.calls.length;

			// Call count should remain the same
			expect( secondCallCount ).toBe( firstCallCount );

			// registerAbilityCategory should not be called again on second registration
			const categoryCallsAfterFirst = ( registerAbilityCategory as jest.Mock ).mock.calls.length;
			await registerBlockNotesAbility();
			expect( ( registerAbilityCategory as jest.Mock ).mock.calls.length ).toBe(
				categoryCallsAfterFirst
			);
		} );
	} );

	describe( 'Callback - get operation', () => {
		beforeEach( async () => {
			await registerBlockNotesAbility();
		} );

		it( 'should fetch and return notes successfully', async () => {
			const mockNotes = [
				{ note_ID: 1, note_content: 'Test note 1' },
				{ note_ID: 2, note_content: 'Test note 2' },
			];

			jest.spyOn( utils, 'getBlockNotes' ).mockResolvedValue( mockNotes );

			const result = await mockCallback( {
				operation: 'get',
				blockNoteId: TEST_BLOCK_NOTE_ID,
			} );

			expect( utils.getBlockNotes ).toHaveBeenCalledWith( TEST_POST_ID, TEST_BLOCK_NOTE_ID );
			expect( result ).toEqual( {
				success: true,
				notes: mockNotes,
				returnToAgent: true,
			} );
		} );

		it( 'should return empty array when blockNoteId is not provided', async () => {
			const result = await mockCallback( {
				operation: 'get',
				blockNoteId: 0,
			} );

			expect( result ).toEqual( {
				success: true,
				result: 'No existing note thread found for this block',
				notes: [],
				returnToAgent: true,
			} );
		} );

		it( 'should return error when postId is unavailable', async () => {
			// Override the default mock to return null for this test
			mockGetCurrentPostId.mockReturnValueOnce( null );

			const result = await mockCallback( {
				operation: 'get',
				blockNoteId: TEST_BLOCK_NOTE_ID,
			} );

			expect( result ).toEqual( {
				success: false,
				error: 'Unable to get current post ID',
				returnToAgent: true,
			} );
		} );
	} );

	describe( 'Callback - reply operation', () => {
		beforeEach( async () => {
			await registerBlockNotesAbility();
		} );

		it( 'should create reply and track success', async () => {
			const mockNote = {
				note_ID: 789,
				note_parent: TEST_BLOCK_NOTE_ID,
				note_content: TEST_REPLY_TEXT,
			};

			jest.spyOn( utils, 'replyToNote' ).mockResolvedValue( mockNote );

			const result = await mockCallback( {
				operation: 'reply',
				blockNoteId: TEST_BLOCK_NOTE_ID,
				notes: TEST_REPLY_TEXT,
			} );

			expect( utils.replyToNote ).toHaveBeenCalledWith(
				TEST_POST_ID,
				TEST_BLOCK_NOTE_ID,
				TEST_REPLY_TEXT,
				'AI [experimental]'
			);
			expect( tracking.trackBlockNoteAiReplyCreated ).toHaveBeenCalledWith( {
				noteId: mockNote.note_ID,
				postId: TEST_POST_ID,
				parentNoteId: mockNote.note_parent,
				sessionId: 'test-session-id',
			} );
			expect( result ).toEqual( {
				success: true,
				note: mockNote,
				message: 'Reply posted successfully',
				returnToAgent: true,
			} );
		} );

		it( 'should return error when reply text is missing', async () => {
			const result = await mockCallback( {
				operation: 'reply',
				blockNoteId: TEST_BLOCK_NOTE_ID,
				notes: '',
			} );

			expect( result ).toEqual( {
				success: false,
				error:
					'Reply text is required but was empty or missing. Please provide your response content.',
				returnToAgent: true,
			} );
		} );

		it( 'should return error when blockNoteId is missing', async () => {
			const result = await mockCallback( {
				operation: 'reply',
				blockNoteId: 0,
				notes: TEST_REPLY_TEXT,
			} );

			expect( result ).toEqual( {
				success: false,
				error: 'blockNoteId is required for reply operation',
				returnToAgent: true,
			} );
		} );
	} );

	describe( 'Callback - error handling', () => {
		beforeEach( async () => {
			await registerBlockNotesAbility();
		} );

		it( 'should catch and track errors during reply operation', async () => {
			const testError = new Error( 'test error' );
			jest.spyOn( utils, 'replyToNote' ).mockRejectedValue( testError );

			const result = await mockCallback( {
				operation: 'reply',
				blockNoteId: TEST_BLOCK_NOTE_ID,
				notes: TEST_REPLY_TEXT,
			} );

			expect( tracking.trackBlockNoteAiReplyFailed ).toHaveBeenCalledWith( {
				noteId: TEST_BLOCK_NOTE_ID,
				postId: TEST_POST_ID,
				errorType: 'ability_failed',
				sessionId: 'test-session-id',
			} );
			expect( consoleErrorSpy ).toHaveBeenCalledWith(
				'Block Notes: Ability execution failed',
				testError
			);
			expect( result ).toEqual( {
				success: false,
				error: 'Failed to perform note action: test error',
				returnToAgent: true,
			} );
		} );
	} );
} );
