/**
 * Unit tests for block-notes-session utilities
 * Tests cover parameter validation and error handling
 */

import { getBlogId } from '@utils/request-jetpack-token';
import { getBlockNoteThreadSessionId } from './session';

jest.mock( '@utils/request-jetpack-token', () => ( {
	getBlogId: jest.fn( () => 'test-blog-123' ),
} ) );

describe( 'getBlockNoteThreadSessionId', () => {
	const TEST_POST_ID = 123;
	const TEST_NOTE_ID = 456;
	const TEST_BLOG_ID = 'test-blog-123';

	const mockGetBlogId = getBlogId as jest.MockedFunction< typeof getBlogId >;

	beforeEach( () => {
		// Reset to default: return a valid blogId
		mockGetBlogId.mockReturnValue( TEST_BLOG_ID );
	} );

	afterEach( () => {
		jest.clearAllMocks();
	} );

	describe( 'Parameter validation', () => {
		it( 'should return undefined when blogId is null', async () => {
			mockGetBlogId.mockReturnValue( null );
			const result = await getBlockNoteThreadSessionId( TEST_POST_ID, TEST_NOTE_ID );
			expect( result ).toBeUndefined();
		} );

		it( 'should return undefined when blogId is empty string', async () => {
			mockGetBlogId.mockReturnValue( '' );
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
