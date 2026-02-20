/**
 * Unit tests for Block Notes utility functions
 *
 * These tests cover:
 * - getBlockNotes: fetching notes for a block
 * - replyToNote: creating replies to notes
 * - convertEntityNoteFormat: transforming note data
 * - Error handling
 */

// Mock WordPress dependencies
const mockGetEntityRecords = jest.fn();
const mockGetCurrentUser = jest.fn();
const mockSaveEntityRecord = jest.fn();

jest.mock( '@wordpress/data', () => ( {
	resolveSelect: jest.fn( () => ( {
		getEntityRecords: mockGetEntityRecords,
		getCurrentUser: mockGetCurrentUser,
	} ) ),
	dispatch: jest.fn( () => ( {
		saveEntityRecord: mockSaveEntityRecord,
	} ) ),
} ) );

jest.mock( '@wordpress/core-data', () => ( {
	store: 'core',
} ) );

import { convertEntityNoteFormat, getBlockNotes, replyToNote } from './utils';

describe( 'Block Notes Utils', () => {
	const TEST_POST_ID = 123;
	const TEST_NOTE_ID = 456;
	const TEST_USER_ID = 1;
	const TEST_AUTHOR_NAME = 'Test User';
	const TEST_AUTHOR_EMAIL = 'test@example.com';
	const TEST_NOTE_CONTENT = 'This is a test note';
	const TEST_DATE = '2024-01-01T00:00:00';
	const TEST_DATE_GMT = '2024-01-01T00:00:00';
	const ERROR_MESSAGE = 'API error';

	let consoleErrorSpy: jest.SpyInstance;

	beforeEach( () => {
		jest.clearAllMocks();
		consoleErrorSpy = jest.spyOn( console, 'error' ).mockImplementation( () => {} );

		// Default: current user exists
		mockGetCurrentUser.mockResolvedValue( {
			id: TEST_USER_ID,
			name: TEST_AUTHOR_NAME,
			email: TEST_AUTHOR_EMAIL,
		} );
	} );

	afterEach( () => {
		jest.restoreAllMocks();
	} );

	describe( 'getBlockNotes', () => {
		const mockNoteEntity = {
			id: 1,
			post: TEST_POST_ID,
			author: TEST_USER_ID,
			author_name: TEST_AUTHOR_NAME,
			content: {
				rendered: TEST_NOTE_CONTENT,
			},
			parent: TEST_NOTE_ID,
			type: 'note',
			status: 'approved',
			date: TEST_DATE,
			date_gmt: TEST_DATE_GMT,
		};

		it( 'fetches and converts notes for a block', async () => {
			mockGetEntityRecords.mockResolvedValue( [ mockNoteEntity ] );

			const result = await getBlockNotes( TEST_POST_ID, TEST_NOTE_ID );

			expect( mockGetEntityRecords ).toHaveBeenCalledWith( 'root', 'comment', {
				post: TEST_POST_ID,
				parent: TEST_NOTE_ID,
				type: 'note',
				status: 'any',
				context: 'edit',
				_locale: 'user',
			} );

			expect( result ).toEqual( [
				{
					note_ID: 1,
					note_post_ID: TEST_POST_ID,
					note_author: TEST_AUTHOR_NAME,
					note_content: TEST_NOTE_CONTENT,
					note_parent: TEST_NOTE_ID,
					user_id: TEST_USER_ID,
					note_type: 'note',
					note_approved: 1,
					note_date: TEST_DATE,
					note_date_gmt: TEST_DATE_GMT,
				},
			] );
		} );

		it( 'returns empty array when no notes exist', async () => {
			mockGetEntityRecords.mockResolvedValue( null );

			const result = await getBlockNotes( TEST_POST_ID, TEST_NOTE_ID );

			expect( result ).toEqual( [] );
		} );

		it( 'handles API errors and logs them', async () => {
			const apiError = new Error( ERROR_MESSAGE );
			( apiError as any ).code = 'rest_forbidden';
			( apiError as any ).data = { status: 403 };

			mockGetEntityRecords.mockRejectedValue( apiError );

			await expect( getBlockNotes( TEST_POST_ID, TEST_NOTE_ID ) ).rejects.toThrow( ERROR_MESSAGE );

			expect( consoleErrorSpy ).toHaveBeenCalledWith(
				'Block Notes: API error:',
				expect.objectContaining( {
					message: ERROR_MESSAGE,
					code: 'rest_forbidden',
					data: { status: 403 },
					postId: TEST_POST_ID,
					noteId: TEST_NOTE_ID,
				} )
			);
		} );

		it( 'handles multiple notes', async () => {
			const multipleNotes = [
				{ ...mockNoteEntity, id: 1 },
				{ ...mockNoteEntity, id: 2 },
				{ ...mockNoteEntity, id: 3 },
			];

			mockGetEntityRecords.mockResolvedValue( multipleNotes );

			const result = await getBlockNotes( TEST_POST_ID, TEST_NOTE_ID );

			expect( result ).toHaveLength( 3 );
			expect( result[ 0 ].note_ID ).toBe( 1 );
			expect( result[ 1 ].note_ID ).toBe( 2 );
			expect( result[ 2 ].note_ID ).toBe( 3 );
		} );
	} );

	describe( 'replyToNote', () => {
		const mockCreatedNote = {
			id: 789,
			post: TEST_POST_ID,
			author: TEST_USER_ID,
			author_name: TEST_AUTHOR_NAME,
			author_email: TEST_AUTHOR_EMAIL,
			content: TEST_NOTE_CONTENT,
			parent: TEST_NOTE_ID,
			type: 'note',
			status: 'hold',
			date: TEST_DATE,
			date_gmt: TEST_DATE_GMT,
		};

		it( 'creates a reply with provided author name', async () => {
			mockSaveEntityRecord.mockResolvedValue( mockCreatedNote );

			const result = await replyToNote(
				TEST_POST_ID,
				TEST_NOTE_ID,
				TEST_NOTE_CONTENT,
				'Custom Author'
			);

			expect( mockSaveEntityRecord ).toHaveBeenCalledWith( 'root', 'comment', {
				post: TEST_POST_ID,
				content: TEST_NOTE_CONTENT,
				type: 'note',
				parent: TEST_NOTE_ID,
				author: TEST_USER_ID,
				author_name: 'Custom Author',
				author_email: TEST_AUTHOR_EMAIL,
				status: 'hold',
			} );

			expect( result ).toEqual( {
				note_ID: 789,
				note_post_ID: TEST_POST_ID,
				note_author: TEST_AUTHOR_NAME,
				note_content: TEST_NOTE_CONTENT,
				note_parent: TEST_NOTE_ID,
				user_id: TEST_USER_ID,
				note_type: 'note',
				note_approved: 0,
				note_date: TEST_DATE,
				note_date_gmt: TEST_DATE_GMT,
			} );
		} );

		it( 'creates a reply with default author name from current user', async () => {
			mockSaveEntityRecord.mockResolvedValue( mockCreatedNote );

			await replyToNote( TEST_POST_ID, TEST_NOTE_ID, TEST_NOTE_CONTENT );

			expect( mockSaveEntityRecord ).toHaveBeenCalledWith(
				'root',
				'comment',
				expect.objectContaining( {
					author_name: TEST_AUTHOR_NAME,
				} )
			);
		} );

		it( 'handles errors when creating note fails', async () => {
			const createError = new Error( ERROR_MESSAGE );
			mockSaveEntityRecord.mockRejectedValue( createError );

			await expect(
				replyToNote( TEST_POST_ID, TEST_NOTE_ID, TEST_NOTE_CONTENT, TEST_AUTHOR_NAME )
			).rejects.toThrow( ERROR_MESSAGE );

			expect( consoleErrorSpy ).toHaveBeenCalledWith(
				'❌ Failed to create block note:',
				createError
			);
		} );
	} );

	describe( 'convertEntityNoteFormat', () => {
		it( 'converts note with rendered content', () => {
			const entityNote = {
				id: 1,
				post: TEST_POST_ID,
				author: TEST_USER_ID,
				author_name: TEST_AUTHOR_NAME,
				content: {
					rendered: TEST_NOTE_CONTENT,
					raw: 'Raw content',
				},
				parent: TEST_NOTE_ID,
				type: 'note',
				status: 'approved',
				date: TEST_DATE,
				date_gmt: TEST_DATE_GMT,
			};

			const result = convertEntityNoteFormat( entityNote );

			expect( result ).toEqual( {
				note_ID: 1,
				note_post_ID: TEST_POST_ID,
				note_author: TEST_AUTHOR_NAME,
				note_content: TEST_NOTE_CONTENT,
				note_parent: TEST_NOTE_ID,
				user_id: TEST_USER_ID,
				note_type: 'note',
				note_approved: 1,
				note_date: TEST_DATE,
				note_date_gmt: TEST_DATE_GMT,
			} );
		} );

		it( 'converts note with string content', () => {
			const entityNote = {
				id: 1,
				post: TEST_POST_ID,
				author: TEST_USER_ID,
				author_name: TEST_AUTHOR_NAME,
				content: TEST_NOTE_CONTENT,
				parent: TEST_NOTE_ID,
				type: 'note',
				status: 'approved',
				date: TEST_DATE,
				date_gmt: TEST_DATE_GMT,
			};

			const result = convertEntityNoteFormat( entityNote );

			expect( result.note_content ).toBe( TEST_NOTE_CONTENT );
		} );

		it( 'converts note with empty content object', () => {
			const entityNote = {
				id: 1,
				post: TEST_POST_ID,
				author: TEST_USER_ID,
				author_name: TEST_AUTHOR_NAME,
				content: {},
				parent: TEST_NOTE_ID,
				type: 'note',
				status: 'approved',
				date: TEST_DATE,
				date_gmt: TEST_DATE_GMT,
			};

			const result = convertEntityNoteFormat( entityNote );

			expect( result.note_content ).toBe( '' );
		} );

		it( 'sets note_approved to 0 for non-approved status', () => {
			const statuses = [ 'hold', 'pending', 'spam', 'trash' ];

			statuses.forEach( ( status ) => {
				const entityNote = {
					id: 1,
					post: TEST_POST_ID,
					author: TEST_USER_ID,
					author_name: TEST_AUTHOR_NAME,
					content: TEST_NOTE_CONTENT,
					parent: TEST_NOTE_ID,
					type: 'note',
					status,
					date: TEST_DATE,
					date_gmt: TEST_DATE_GMT,
				};

				const result = convertEntityNoteFormat( entityNote );

				expect( result.note_approved ).toBe( 0 );
			} );
		} );

		it( 'preserves all required fields', () => {
			const entityNote = {
				id: 999,
				post: 888,
				author: 777,
				author_name: 'Author Name',
				content: 'Content',
				parent: 666,
				type: 'note',
				status: 'hold',
				date: '2025-01-01',
				date_gmt: '2025-01-01',
			};

			const result = convertEntityNoteFormat( entityNote );

			expect( result.note_ID ).toBe( entityNote.id );
			expect( result.note_post_ID ).toBe( entityNote.post );
			expect( result.user_id ).toBe( entityNote.author );
			expect( result.note_author ).toBe( entityNote.author_name );
			expect( result.note_content ).toBe( entityNote.content );
			expect( result.note_parent ).toBe( entityNote.parent );
			expect( result.note_type ).toBe( entityNote.type );
			expect( result.note_approved ).toBe( 0 );
			expect( result.note_date ).toBe( entityNote.date );
			expect( result.note_date_gmt ).toBe( entityNote.date_gmt );
		} );
	} );
} );
