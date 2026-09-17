import { sanitizeDomainInput, sanitizeKeywordInput } from '..';

describe( 'sanitizeDomainInput', () => {
	it( 'lowercases, strips invalid characters and tidies hyphens', () => {
		expect( sanitizeDomainInput( 'Coffee Shop!' ) ).toBe( 'coffeeshop' );
		expect( sanitizeDomainInput( 'café' ) ).toBe( 'caf' );
		expect( sanitizeDomainInput( 'coffee.com' ) ).toBe( 'coffeecom' );
		expect( sanitizeDomainInput( '--coffee--shop--' ) ).toBe( 'coffee-shop' );
		expect( sanitizeDomainInput( '---' ) ).toBe( '' );
	} );
} );

describe( 'sanitizeKeywordInput', () => {
	it( 'turns punctuation into word boundaries and drops punctuation-only input', () => {
		expect( sanitizeKeywordInput( 'Coffee-Shop!  NYC' ) ).toBe( 'coffee shop nyc' );
		expect( sanitizeKeywordInput( '  best   coffee  ' ) ).toBe( 'best coffee' );
		expect( sanitizeKeywordInput( '!!! ???' ) ).toBe( '' );
	} );
} );
