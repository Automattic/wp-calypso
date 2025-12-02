/**
 * @jest-environment jsdom
 */
import { detectUrls } from '../content-processor';

describe( 'detectUrls', () => {
	describe( 'href attribute URLs', () => {
		it( 'should NOT detect URLs from href attributes with regular anchor text', () => {
			const content = '<a href="https://example.com">Regular link</a>';
			const url = detectUrls( content );
			expect( url ).toBe( null );
		} );

		it( 'should detect URLs from href attributes when link text is also a URL', () => {
			const content = '<a href="https://example.com">https://example.com</a>';
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

		it( 'should NOT include URLs that contain @ or # in the middle of link text', () => {
			const content = '<a href="https://example.com">Contact us @ example.com</a>';
			const url = detectUrls( content );
			expect( url ).toBe( null );
		} );

		it( 'should skip non-http URLs', () => {
			const content = '<a href="mailto:test@example.com">Email</a>';
			const url = detectUrls( content );
			expect( url ).toBe( null );
		} );

		it( 'should return only the first URL when duplicates exist with URL text', () => {
			const content =
				'<a href="https://example.com">https://example.com</a> <a href="https://example.com">https://example.com</a>';
			const url = detectUrls( content );
			expect( url ).toBe( 'https://example.com' );
		} );

		it( 'should return only the first URL when multiple different URLs exist with URL text', () => {
			const content =
				'<a href="https://example.com">https://example.com</a> <a href="https://test.com">https://test.com</a>';
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

		it( 'should not detect URLs inside HTML tags with regular anchor text', () => {
			const content = '<a href="https://example.com">Link</a>';
			const url = detectUrls( content );
			expect( url ).toBe( null );
		} );

		it( 'should detect URLs inside HTML tags when link text is also a URL', () => {
			const content = '<a href="https://example.com">https://example.com</a>';
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

		it( 'should NOT fall back to HTML link URL when no plain text URLs exist', () => {
			const content = '<a href="https://example.com">Only HTML link</a>';
			const url = detectUrls( content );
			expect( url ).toBe( null );
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

		it( 'should NOT handle complex HTML with nested elements and regular anchor text', () => {
			const content =
				'<div><p>Text with <a href="https://example.com"><strong>bold link</strong></a></p></div>';
			const url = detectUrls( content );
			expect( url ).toBe( null );
		} );

		it( 'should handle complex HTML with nested elements when link text is a URL', () => {
			const content =
				'<div><p>Text with <a href="https://example.com"><strong>https://example.com</strong></a></p></div>';
			const url = detectUrls( content );
			expect( url ).toBe( 'https://example.com' );
		} );

		it( 'should return null when only mentions and hashtags exist', () => {
			const content = `
				<a href="https://twitter.com/user">@user</a>
				<a href="https://twitter.com/hashtag/test">#test</a>
				<a href="https://example.com">Regular Link</a>
			`;
			const url = detectUrls( content );
			expect( url ).toBe( null );
		} );

		it( 'should return first valid URL with URL text, skipping mentions and hashtags', () => {
			const content = `
				<a href="https://twitter.com/user">@user</a>
				<a href="https://twitter.com/hashtag/test">#test</a>
				<a href="https://example.com">https://example.com</a>
			`;
			const url = detectUrls( content );
			expect( url ).toBe( 'https://example.com' );
		} );
	} );

	describe( 'media element detection', () => {
		it( 'should return null when content contains images', () => {
			const content = `
				<p>Check out this site: https://example.com</p>
				<img src="image.jpg" alt="Test image" />
			`;
			const url = detectUrls( content );
			expect( url ).toBe( null );
		} );

		it( 'should return null when content contains videos', () => {
			const content = `
				<a href="https://example.com">Example Link</a>
				<video src="video.mp4" controls></video>
			`;
			const url = detectUrls( content );
			expect( url ).toBe( null );
		} );

		it( 'should return null when content contains audio', () => {
			const content = `
				Visit https://test.com for more info
				<audio src="audio.mp3" controls></audio>
			`;
			const url = detectUrls( content );
			expect( url ).toBe( null );
		} );

		it( 'should return null when content contains multiple media types', () => {
			const content = `
				<a href="https://example.com">Link</a>
				<img src="image.jpg" alt="Image" />
				<video src="video.mp4"></video>
				<audio src="audio.mp3"></audio>
				https://plaintext.com
			`;
			const url = detectUrls( content );
			expect( url ).toBe( null );
		} );

		it( 'should return null when content contains iframes', () => {
			const content = `
				<p>Check out this site: https://example.com</p>
				<iframe src="https://youtube.com/embed/video123" width="560" height="315"></iframe>
			`;
			const url = detectUrls( content );
			expect( url ).toBe( null );
		} );

		it( 'should NOT detect URLs when no media elements are present but anchor text is regular', () => {
			const content = `
				<p>Some text content</p>
				<a href="https://example.com">Example Link</a>
				<div>More content</div>
			`;
			const url = detectUrls( content );
			expect( url ).toBe( null );
		} );

		it( 'should prioritize HTML links where link text is a URL', () => {
			const content = `
				<a href="https://example.com">Click here</a>
				<a href="https://test.com">https://test.com</a>
			`;
			const url = detectUrls( content );
			expect( url ).toBe( 'https://test.com' );
		} );

		it( 'should prioritize URL link text even when it appears later', () => {
			const content = `
				<a href="https://first.com">First Link</a>
				<a href="https://second.com">Some text</a>
				<a href="https://third.com">https://third.com</a>
				<a href="https://fourth.com">Another link</a>
			`;
			const url = detectUrls( content );
			expect( url ).toBe( 'https://third.com' );
		} );

		it( 'should NOT fall back to regular HTML links if no URL link text found', () => {
			const content = `
				<a href="https://example.com">Click here</a>
				<a href="https://test.com">Visit this site</a>
			`;
			const url = detectUrls( content );
			expect( url ).toBe( null );
		} );
	} );
} );
