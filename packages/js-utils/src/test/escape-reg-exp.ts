import escapeRegExp from '../escape-reg-exp';

describe( 'escapeRegExp', () => {
	it( 'escapes RegExp special characters', () => {
		expect( escapeRegExp( '[link](https://example.com/)' ) ).toBe(
			'\\[link\\]\\(https://example\\.com/\\)'
		);
		expect( escapeRegExp( 'a.b*c+?' ) ).toBe( 'a\\.b\\*c\\+\\?' );
		expect( escapeRegExp( '^start$' ) ).toBe( '\\^start\\$' );
		expect( escapeRegExp( 'x|y{1}' ) ).toBe( 'x\\|y\\{1\\}' );
	} );

	it( 'leaves non-special characters untouched', () => {
		expect( escapeRegExp( 'plain text 123' ) ).toBe( 'plain text 123' );
		expect( escapeRegExp( '' ) ).toBe( '' );
	} );
} );
