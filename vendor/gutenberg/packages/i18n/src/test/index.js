/**
 * Internal dependencies
 */
import { dcnpgettext, sprintf, __, _x, _n, _nx, setLocaleData } from '../';

// Mock memoization as identity function. Inline since Jest errors on out-of-
// scope references in a mock callback.
jest.mock( 'memize', () => ( fn ) => fn );

const localeData = {
	'': {
		// Domain name
		domain: 'test_domain',
		lang: 'fr',
		// Plural form function for language
		plural_forms: 'nplurals=2; plural=(n != 1);',
	},

	hello: [ 'bonjour' ],

	'verb\u0004feed': [ 'nourrir' ],

	'hello %s': [ 'bonjour %s' ],

	'%d banana': [ 'une banane', '%d bananes' ],

	'fruit\u0004%d apple': [ 'une pomme', '%d pommes' ],
};
const additionalLocaleData = {
	cheeseburger: [ 'hamburger au fromage' ],
	'%d cat': [ 'un chat', '%d chats' ],
};

setLocaleData( localeData, 'test_domain' );

describe( 'i18n', () => {
	describe( 'dcnpgettext()', () => {
		it( 'absorbs errors', () => {
			const result = dcnpgettext( 'domain-without-data', undefined, 'Hello' );

			expect( console ).toHaveErrored();
			expect( result ).toBe( 'Hello' );
		} );
	} );

	describe( '__', () => {
		it( 'use the translation', () => {
			expect( __( 'hello', 'test_domain' ) ).toBe( 'bonjour' );
		} );
	} );

	describe( '_x', () => {
		it( 'use the translation with context', () => {
			expect( _x( 'feed', 'verb', 'test_domain' ) ).toBe( 'nourrir' );
		} );
	} );

	describe( '_n', () => {
		it( 'use the plural form', () => {
			expect( _n( '%d banana', '%d bananas', 3, 'test_domain' ) ).toBe( '%d bananes' );
		} );

		it( 'use the singular form', () => {
			expect( _n( '%d banana', '%d bananas', 1, 'test_domain' ) ).toBe( 'une banane' );
		} );
	} );

	describe( '_nx', () => {
		it( 'use the plural form', () => {
			expect( _nx( '%d apple', '%d apples', 3, 'fruit', 'test_domain' ) ).toBe( '%d pommes' );
		} );

		it( 'use the singular form', () => {
			expect( _nx( '%d apple', '%d apples', 1, 'fruit', 'test_domain' ) ).toBe( 'une pomme' );
		} );
	} );

	describe( 'sprintf()', () => {
		it( 'absorbs errors', () => {
			const result = sprintf( 'Hello %(placeholder-not-provided)s' );

			expect( console ).toHaveErrored();
			expect( result ).toBe( 'Hello %(placeholder-not-provided)s' );
		} );

		it( 'replaces placeholders', () => {
			const result = sprintf( __( 'hello %s', 'test_domain' ), 'Riad' );

			expect( result ).toBe( 'bonjour Riad' );
		} );
	} );

	describe( 'setAdditionalLocale', () => {
		beforeAll( () => {
			setLocaleData( additionalLocaleData, 'test_domain' );
		} );
		describe( '__', () => {
			it( 'existing translation still available', () => {
				expect( __( 'hello', 'test_domain' ) ).toBe( 'bonjour' );
			} );

			it( 'new translation available.', () => {
				expect( __( 'cheeseburger', 'test_domain' ) ).toBe( 'hamburger au fromage' );
			} );
		} );

		describe( '_n', () => {
			it( 'existing plural form still works', () => {
				expect( _n( '%d banana', '%d bananas', 3, 'test_domain' ) ).toBe( '%d bananes' );
			} );

			it( 'new singular form was added', () => {
				expect( _n( '%d cat', '%d cats', 1, 'test_domain' ) ).toBe( 'un chat' );
			} );

			it( 'new plural form was added', () => {
				expect( _n( '%d cat', '%d cats', 3, 'test_domain' ) ).toBe( '%d chats' );
			} );
		} );
	} );
} );
