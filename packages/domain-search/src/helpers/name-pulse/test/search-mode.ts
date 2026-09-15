import { getSearchMode, getWordCount } from '..';

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

describe( 'getSearchMode', () => {
	it( 'uses exact mode for 1–3 words and AI mode from 4 words', () => {
		expect( getSearchMode( 1 ) ).toBe( 'exact' );
		expect( getSearchMode( 3 ) ).toBe( 'exact' );
		expect( getSearchMode( 4 ) ).toBe( 'ai' );
		expect( getSearchMode( 9 ) ).toBe( 'ai' );
	} );
} );
