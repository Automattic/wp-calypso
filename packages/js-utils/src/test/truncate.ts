import truncate from '../truncate';

describe( 'truncate', () => {
	it( 'truncates with the default length and omission', () => {
		expect( truncate( 'default length truncation happens past thirty chars' ) ).toBe(
			'default length truncation h...'
		);
	} );

	it( 'returns the string unchanged when within the length', () => {
		expect( truncate( 'short', { length: 24 } ) ).toBe( 'short' );
	} );

	it( 'honors a custom length', () => {
		expect( truncate( 'filename-that-is-really-quite-long.zip', { length: 40 } ) ).toBe(
			'filename-that-is-really-quite-long.zip'
		);
		expect( truncate( 'Hello world this is a long title', { length: 24 } ) ).toBe(
			'Hello world this is a...'
		);
	} );

	it( 'truncates to a regexp separator boundary', () => {
		expect(
			truncate( 'Reader post title, with punctuation and spaces here', {
				length: 30,
				separator: /,? +/,
			} )
		).toBe( 'Reader post title, with...' );
	} );

	it( 'truncates to a string separator boundary', () => {
		expect( truncate( 'word boundary test here', { length: 12, separator: ' ' } ) ).toBe(
			'word...'
		);
	} );

	it( 'returns just the omission when the length is shorter than it', () => {
		expect( truncate( 'tiny string here', { length: 2 } ) ).toBe( '...' );
	} );

	describe( 'lenient option coercion (matching lodash)', () => {
		it( 'falls back to defaults for non-object options', () => {
			// @ts-expect-error -- exercises lenient handling for untyped callers.
			expect( truncate( 'abcdef', null ) ).toBe( 'abcdef' );
			// @ts-expect-error -- see above.
			expect( truncate( 'abcdef', 'xx' ) ).toBe( 'abcdef' );
		} );

		it( 'coerces length via toInteger', () => {
			// @ts-expect-error -- null length coerces to 0, like lodash.
			expect( truncate( 'abcdef', { length: null } ) ).toBe( '...' );
			// @ts-expect-error -- string length coerces.
			expect( truncate( 'abcdefghij', { length: '5' } ) ).toBe( 'ab...' );
			expect( truncate( 'abcdefghij', { length: 4.9 } ) ).toBe( 'a...' );
		} );

		it( 'coerces omission to a string', () => {
			// @ts-expect-error -- numeric omission coerces to its string form.
			expect( truncate( 'abcdef', { length: 4, omission: 1 } ) ).toBe( 'abc1' );
		} );

		it( 'coerces negative zero to "-0" like lodash baseToString', () => {
			// @ts-expect-error -- exercises the -0 coercion edge.
			expect( truncate( 'abcdef', { length: 4, omission: -0 } ) ).toBe( 'ab-0' );
			// @ts-expect-error -- -0 input coerces to "-0".
			expect( truncate( -0 ) ).toBe( '-0' );
		} );

		it( 'coerces symbols (primitive and boxed) without throwing', () => {
			// @ts-expect-error -- symbol input stringifies to its description.
			expect( truncate( Symbol( 'x' ) ) ).toBe( 'Symbol(x)' );
			// @ts-expect-error -- boxed symbols are handled too, like lodash.
			expect( truncate( Object( Symbol( 'x' ) ) ) ).toBe( 'Symbol(x)' );
		} );
	} );

	describe( 'Unicode grapheme clusters (matching lodash)', () => {
		const grin = String.fromCodePoint( 0x1f600 ); // 😀
		const us = String.fromCodePoint( 0x1f1fa, 0x1f1f8 ); // 🇺🇸
		const gb = String.fromCodePoint( 0x1f1ec, 0x1f1e7 ); // 🇬🇧
		const fr = String.fromCodePoint( 0x1f1eb, 0x1f1f7 ); // 🇫🇷
		const zwj = String.fromCodePoint( 0x200d ); // zero-width joiner
		const family =
			String.fromCodePoint( 0x1f468 ) +
			zwj +
			String.fromCodePoint( 0x1f469 ) +
			zwj +
			String.fromCodePoint( 0x1f467 ); // 👨‍👩‍👧
		const eAcute = String.fromCodePoint( 0x65, 0x301 ); // decomposed "é" (e + combining acute)

		it( 'does not split surrogate-pair emoji', () => {
			expect( truncate( grin.repeat( 12 ), { length: 6 } ) ).toBe( grin.repeat( 3 ) + '...' );
		} );

		it( 'keeps regional-indicator flags whole', () => {
			expect( truncate( us + gb + fr + ' rest of string here longer', { length: 5 } ) ).toBe(
				us + gb + '...'
			);
		} );

		it( 'keeps ZWJ emoji sequences whole', () => {
			expect( truncate( family.repeat( 3 ) + ' more text here', { length: 4 } ) ).toBe(
				family + '...'
			);
		} );

		it( 'keeps a combining mark with its base character', () => {
			expect( truncate( eAcute + 'abc' + eAcute + 'xyz more text', { length: 5 } ) ).toBe(
				eAcute + 'a...'
			);
		} );
	} );
} );
