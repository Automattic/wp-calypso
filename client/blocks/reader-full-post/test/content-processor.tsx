/**
 * @jest-environment jsdom
 */
import { detectUrls } from '../content-processor';

describe( 'detectUrls', () => {
	describe( 'href attribute URLs', () => {
		it( 'should detect URLs from href attributes', () => {
			const content = '<a href="https://example.com">Regular link</a>';
			const url = detectUrls( content );
			expect( url ).toBe( 'https://example.com' );
		} );

		it( 'should skip URLs with mention link text', () => {
			const content = '<a href="https://twitter.com/user">@username</a>';
			const url = detectUrls( content );
			expect( url ).toBe( null );
		} );

		it( 'should skip URLs with hashtag link text', () => {
			const content = '<a href="https://twitter.com/hashtag/test">#hashtag</a>';
			const url = detectUrls( content );
			expect( url ).toBe( null );
		} );

		it( 'should skip URLs with mention link text with whitespace', () => {
			const content = '<a href="https://twitter.com/user">  @username  </a>';
			const url = detectUrls( content );
			expect( url ).toBe( null );
		} );

		it( 'should skip URLs with hashtag link text with whitespace', () => {
			const content = '<a href="https://twitter.com/hashtag/test">  #hashtag  </a>';
			const url = detectUrls( content );
			expect( url ).toBe( null );
		} );

		it( 'should include URLs that contain @ or # in the middle of link text', () => {
			const content = '<a href="https://example.com">Contact us @ example.com</a>';
			const url = detectUrls( content );
			expect( url ).toBe( 'https://example.com' );
		} );

		it( 'should skip non-http URLs', () => {
			const content = '<a href="mailto:test@example.com">Email</a>';
			const url = detectUrls( content );
			expect( url ).toBe( null );
		} );

		it( 'should return only the first URL when duplicates exist', () => {
			const content =
				'<a href="https://example.com">First</a> <a href="https://example.com">Second</a>';
			const url = detectUrls( content );
			expect( url ).toBe( 'https://example.com' );
		} );

		it( 'should return only the first URL when multiple different URLs exist', () => {
			const content =
				'<a href="https://example.com">First</a> <a href="https://test.com">Second</a>';
			const url = detectUrls( content );
			expect( url ).toBe( 'https://example.com' );
		} );
	} );

	describe( 'plain text URLs', () => {
		it( 'should detect plain text URLs', () => {
			const content = 'Check out https://example.com for more info';
			const url = detectUrls( content );
			expect( url ).toBe( 'https://example.com' );
		} );

		it( 'should return only the first plain text URL when multiple exist', () => {
			const content = 'Visit https://example.com and https://test.com';
			const url = detectUrls( content );
			expect( url ).toBe( 'https://example.com' );
		} );

		it( 'should not detect URLs inside HTML tags', () => {
			const content = '<a href="https://example.com">Link</a>';
			const url = detectUrls( content );
			expect( url ).toBe( 'https://example.com' );
		} );

		it( 'should return plain text URL even if HTML link comes first in document order', () => {
			const content = '<a href="https://example.com">Link</a> and plain https://test.com';
			const url = detectUrls( content );
			expect( url ).toBe( 'https://test.com' );
		} );

		it( 'should return plain text URL when HTML and plain text URLs are the same', () => {
			const content = '<a href="https://example.com">Link</a> and plain https://example.com';
			const url = detectUrls( content );
			expect( url ).toBe( 'https://example.com' );
		} );

		it( 'should fall back to HTML link URL when no plain text URLs exist', () => {
			const content = '<a href="https://example.com">Only HTML link</a>';
			const url = detectUrls( content );
			expect( url ).toBe( 'https://example.com' );
		} );
	} );

	describe( 'edge cases', () => {
		it( 'should return null for empty content', () => {
			const url = detectUrls( '' );
			expect( url ).toBe( null );
		} );

		it( 'should return null for content with no URLs', () => {
			const content = 'This is just plain text with no URLs';
			const url = detectUrls( content );
			expect( url ).toBe( null );
		} );

		it( 'should handle complex HTML with nested elements', () => {
			const content =
				'<div><p>Text with <a href="https://example.com"><strong>bold link</strong></a></p></div>';
			const url = detectUrls( content );
			expect( url ).toBe( 'https://example.com' );
		} );

		it( 'should return first valid URL, skipping mentions and hashtags', () => {
			const content = `
				<a href="https://twitter.com/user">@user</a>
				<a href="https://twitter.com/hashtag/test">#test</a>
				<a href="https://example.com">Regular Link</a>
			`;
			const url = detectUrls( content );
			expect( url ).toBe( 'https://example.com' );
		} );
	} );
} );
