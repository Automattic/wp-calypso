/**
 * @jest-environment jsdom
 */
import { isValidUrl } from '../../../../lib/importer/url-validation';

describe( 'Profile Gravatar Form Validation', () => {
	describe( 'Display Name Validation', () => {
		const validateDisplayName = ( displayName: string ) => {
			const value = displayName?.trim();
			if ( ! value ) {
				return 'Display name is required.';
			}
			if ( value.length > 250 ) {
				return 'Display name must be 250 characters or less.';
			}
			return null;
		};

		it( 'should require display name', () => {
			expect( validateDisplayName( '' ) ).toBe( 'Display name is required.' );
			expect( validateDisplayName( '   ' ) ).toBe( 'Display name is required.' );
		} );

		it( 'should accept valid display names', () => {
			expect( validateDisplayName( 'John Doe' ) ).toBeNull();
			expect( validateDisplayName( 'Jane Smith' ) ).toBeNull();
		} );

		it( 'should reject display names that are too long', () => {
			const longName = 'a'.repeat( 251 );
			expect( validateDisplayName( longName ) ).toBe(
				'Display name must be 250 characters or less.'
			);
		} );

		it( 'should accept display names at the character limit', () => {
			const maxLengthName = 'a'.repeat( 250 );
			expect( validateDisplayName( maxLengthName ) ).toBeNull();
		} );
	} );

	describe( 'URL Validation', () => {
		const validateUrl = ( url: string ) => {
			const value = url?.trim();
			if ( ! value ) {
				return null; // Optional field
			}
			if ( ! isValidUrl( value ) ) {
				return 'Please enter a valid URL.';
			}
			return null;
		};

		it( 'should allow empty URLs (optional field)', () => {
			expect( validateUrl( '' ) ).toBeNull();
			expect( validateUrl( '   ' ) ).toBeNull();
		} );

		it( 'should accept valid URLs', () => {
			expect( validateUrl( 'https://example.com' ) ).toBeNull();
			expect( validateUrl( 'http://example.com' ) ).toBeNull();
			expect( validateUrl( 'https://www.example.com/path' ) ).toBeNull();
		} );

		it( 'should reject invalid URLs', () => {
			expect( validateUrl( 'not-a-url' ) ).toBe( 'Please enter a valid URL.' );
			expect( validateUrl( 'http://' ) ).toBe( 'Please enter a valid URL.' );
			expect( validateUrl( 'just-text' ) ).toBe( 'Please enter a valid URL.' );
			expect( validateUrl( 'http://adfdfsd!!@@##asdf' ) ).toBe( 'Please enter a valid URL.' );
		} );
	} );
} );
