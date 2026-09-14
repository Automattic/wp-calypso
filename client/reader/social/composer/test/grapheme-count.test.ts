import { countGraphemes } from '../grapheme-count';

describe( 'countGraphemes', () => {
	it( 'counts plain ASCII characters one per character', () => {
		expect( countGraphemes( 'hello' ) ).toBe( 5 );
	} );

	it( 'counts a multi-codepoint emoji as a single grapheme', () => {
		// U+1F468 U+200D U+1F469 U+200D U+1F467 — family emoji
		expect( countGraphemes( '👨‍👩‍👧' ) ).toBe( 1 );
	} );

	it( 'counts a flag emoji as a single grapheme', () => {
		expect( countGraphemes( '🇫🇷' ) ).toBe( 1 );
	} );

	it( 'counts CRLF as a single grapheme', () => {
		expect( countGraphemes( '\r\n' ) ).toBe( 1 );
	} );

	it( 'counts an empty string as zero', () => {
		expect( countGraphemes( '' ) ).toBe( 0 );
	} );

	it( 'counts mixed text + emoji correctly', () => {
		// h, i, space, 👋, space, t, h, e, r, e — 10 graphemes.
		expect( countGraphemes( 'hi 👋 there' ) ).toBe( 10 );
	} );
} );
