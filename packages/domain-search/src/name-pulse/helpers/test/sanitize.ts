import { getWordCount, sanitizeDomainInput, sanitizeKeywordInput } from '..';

describe( 'sanitizeDomainInput', () => {
	it( 'lowercases and strips invalid characters', () => {
		expect( sanitizeDomainInput( 'Coffee Shop!' ) ).toBe( 'coffeeshop' );
		expect( sanitizeDomainInput( 'café' ) ).toBe( 'caf' );
		expect( sanitizeDomainInput( 'coffee.com' ) ).toBe( 'coffeecom' );
	} );

	it( 'removes leading, trailing and consecutive hyphens', () => {
		expect( sanitizeDomainInput( '--coffee--shop--' ) ).toBe( 'coffee-shop' );
		expect( sanitizeDomainInput( '---' ) ).toBe( '' );
	} );

	it( 'keeps digits', () => {
		expect( sanitizeDomainInput( 'shop247' ) ).toBe( 'shop247' );
	} );
} );

describe( 'sanitizeKeywordInput', () => {
	it( 'turns punctuation into word boundaries and collapses whitespace', () => {
		expect( sanitizeKeywordInput( 'Coffee-Shop!  NYC' ) ).toBe( 'coffee shop nyc' );
		expect( sanitizeKeywordInput( '  best   coffee  ' ) ).toBe( 'best coffee' );
	} );

	it( 'returns an empty string for punctuation-only input', () => {
		expect( sanitizeKeywordInput( '!!! ???' ) ).toBe( '' );
	} );
} );

describe( 'getWordCount', () => {
	it( 'counts sanitized words', () => {
		expect( getWordCount( 'coffee' ) ).toBe( 1 );
		expect( getWordCount( 'coffee shop' ) ).toBe( 2 );
		expect( getWordCount( ' a blog about  specialty coffee ' ) ).toBe( 5 );
	} );

	it( 'ignores punctuation-only tokens and empty input', () => {
		expect( getWordCount( '' ) ).toBe( 0 );
		expect( getWordCount( '!!!' ) ).toBe( 0 );
		expect( getWordCount( 'coffee !!! shop' ) ).toBe( 2 );
	} );
} );
