/**
 * Unit tests for block-notes-session utilities
 * Tests cover parameter validation and error handling
 */

import { getBlockNoteThreadSessionId } from './session';

jest.mock( '@wordpress/editor', () => ( {
	store: 'core/editor',
} ) );

describe( 'getBlockNoteThreadSessionId', () => {
	const TEST_POST_ID = 123;
	const TEST_NOTE_ID = 456;
	const TEST_SITE_ID = 789;

	beforeEach( () => {
		// Default: valid siteId
		window.blockNotesData = { enabled: true, siteId: TEST_SITE_ID };
	} );

	afterEach( () => {
		delete ( window as any ).blockNotesData;
	} );

	describe( 'Parameter validation', () => {
		it( 'should return undefined when blockNotesData is not set', async () => {
			delete ( window as any ).blockNotesData;
			const result = await getBlockNoteThreadSessionId( TEST_POST_ID, TEST_NOTE_ID );
			expect( result ).toBeUndefined();
		} );

		it( 'should return undefined when siteId is missing', async () => {
			window.blockNotesData = { enabled: true };
			const result = await getBlockNoteThreadSessionId( TEST_POST_ID, TEST_NOTE_ID );
			expect( result ).toBeUndefined();
		} );

		it( 'should return undefined when postId is 0', async () => {
			const result = await getBlockNoteThreadSessionId( 0, TEST_NOTE_ID );
			expect( result ).toBeUndefined();
		} );

		it( 'should return undefined when postId is undefined', async () => {
			const result = await getBlockNoteThreadSessionId( undefined, TEST_NOTE_ID );
			expect( result ).toBeUndefined();
		} );

		it( 'should return undefined when noteId is 0', async () => {
			const result = await getBlockNoteThreadSessionId( TEST_POST_ID, 0 );
			expect( result ).toBeUndefined();
		} );
	} );
} );
