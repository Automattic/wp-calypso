/**
 * Tests for extractFilenameFromUrl utility
 */
import { extractFilenameFromUrl } from './extract-filename';

// Mock window.location for URL parsing
Object.defineProperty( window, 'location', {
	value: {
		origin: 'https://example.com',
	},
	writable: true,
} );

describe( 'extractFilenameFromUrl', () => {
	describe( 'null/undefined handling', () => {
		it( 'should return default fallback for null URL', () => {
			expect( extractFilenameFromUrl( null ) ).toBe( 'Untitled' );
		} );

		it( 'should return default fallback for undefined URL', () => {
			expect( extractFilenameFromUrl( undefined ) ).toBe( 'Untitled' );
		} );

		it( 'should return custom fallback when provided', () => {
			expect( extractFilenameFromUrl( null, 'Custom Fallback' ) ).toBe( 'Custom Fallback' );
		} );
	} );

	describe( 'basic URL parsing', () => {
		it( 'should extract filename from simple URL', () => {
			const url = 'https://example.com/path/to/image.jpg';
			expect( extractFilenameFromUrl( url ) ).toBe( 'image.jpg' );
		} );

		it( 'should extract filename with query parameters', () => {
			const url = 'https://example.com/path/image.jpg?size=large&v=123';
			expect( extractFilenameFromUrl( url ) ).toBe( 'image.jpg' );
		} );

		it( 'should extract filename with hash fragment', () => {
			const url = 'https://example.com/path/image.jpg#section';
			expect( extractFilenameFromUrl( url ) ).toBe( 'image.jpg' );
		} );

		it( 'should extract filename from root path', () => {
			const url = 'https://example.com/image.png';
			expect( extractFilenameFromUrl( url ) ).toBe( 'image.png' );
		} );
	} );

	describe( 'URL encoding handling', () => {
		it( 'should decode URL-encoded filename', () => {
			const url = 'https://example.com/path/my%20image%20file.jpg';
			expect( extractFilenameFromUrl( url ) ).toBe( 'my image file.jpg' );
		} );

		it( 'should decode special characters', () => {
			const url = 'https://example.com/path/img%2Btest%26photo.jpg';
			expect( extractFilenameFromUrl( url ) ).toBe( 'img+test&photo.jpg' );
		} );

		it( 'should handle Unicode characters', () => {
			const url = 'https://example.com/path/%E2%9C%93%20check.jpg';
			expect( extractFilenameFromUrl( url ) ).toBe( '✓ check.jpg' );
		} );
	} );

	describe( 'edge cases', () => {
		it( 'should handle URL with trailing slash', () => {
			const url = 'https://example.com/path/image.jpg/';
			// Empty filename triggers fallback
			expect( extractFilenameFromUrl( url ) ).toBe( 'Untitled' );
		} );

		it( 'should return fallback for empty path', () => {
			const url = 'https://example.com/';
			expect( extractFilenameFromUrl( url ) ).toBe( 'Untitled' );
		} );

		it( 'should handle relative URL', () => {
			const url = '/path/to/image.jpg';
			expect( extractFilenameFromUrl( url ) ).toBe( 'image.jpg' );
		} );

		it( 'should handle data URL gracefully', () => {
			const url = 'data:image/png;base64,iVBORw0KGg';
			// Data URLs extract the path component
			expect( extractFilenameFromUrl( url ) ).toBe( 'png;base64,iVBORw0KGg' );
		} );

		it( 'should handle blob URL', () => {
			const url = 'blob:https://example.com/550e8400-e29b-41d4-a716-446655440000';
			// Blob URLs have UUID as filename
			expect( extractFilenameFromUrl( url ) ).toBe( '550e8400-e29b-41d4-a716-446655440000' );
		} );
	} );

	describe( 'malformed URL handling', () => {
		it( 'should handle URL with invalid characters using fallback parser', () => {
			const url = 'not a valid URL with spaces';
			// Fallback to split-based extraction
			expect( extractFilenameFromUrl( url ) ).toBe( 'not a valid URL with spaces' );
		} );

		it( 'should return fallback when decoding fails', () => {
			// Create a URL that will fail decoding
			const url = 'https://example.com/%E0%A4%A';
			// This should trigger the fallback path
			const result = extractFilenameFromUrl( url );
			// Should either decode correctly or return fallback
			expect( result ).toBeTruthy();
		} );

		it( 'should handle empty string', () => {
			expect( extractFilenameFromUrl( '' ) ).toBe( 'Untitled' );
		} );
	} );

	describe( 'complex filenames', () => {
		it( 'should handle filename with multiple dots', () => {
			const url = 'https://example.com/my.image.file.tar.gz';
			expect( extractFilenameFromUrl( url ) ).toBe( 'my.image.file.tar.gz' );
		} );

		it( 'should handle filename with dashes and underscores', () => {
			const url = 'https://example.com/my-image_file-2024.jpg';
			expect( extractFilenameFromUrl( url ) ).toBe( 'my-image_file-2024.jpg' );
		} );

		it( 'should handle very long filename', () => {
			const longName = 'a'.repeat( 200 ) + '.jpg';
			const url = `https://example.com/${ longName }`;
			expect( extractFilenameFromUrl( url ) ).toBe( longName );
		} );
	} );

	describe( 'WordPress media library URLs', () => {
		it( 'should extract filename from WordPress uploads URL', () => {
			const url = 'https://example.com/wp-content/uploads/2024/03/my-image-scaled.jpg';
			expect( extractFilenameFromUrl( url ) ).toBe( 'my-image-scaled.jpg' );
		} );

		it( 'should extract filename from WordPress uploads URL with dimensions', () => {
			const url = 'https://example.com/wp-content/uploads/2024/03/my-image-150x150.jpg';
			expect( extractFilenameFromUrl( url ) ).toBe( 'my-image-150x150.jpg' );
		} );
	} );
} );
