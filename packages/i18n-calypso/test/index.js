/**
 * External dependencies
 */
import React from 'react';
import ReactDomServer from 'react-dom/server';

/**
 * Internal dependencies
 */
import data from './data';
import i18n, { moment, numberFormat, translate } from '../src';

/**
 * Pass in a react-generated html string to remove react-specific attributes
 * to make it easier to compare to expected html structure
 * @param  {string} string React-generated html string
 * @return {string}        html with react attributes removed
 */
function stripReactAttributes( string ) {
	return string.replace( /\sdata\-(reactid|react\-checksum)\=\"[^\"]+\"/g, '' );
}

describe( 'I18n', function() {
	beforeEach( function() {
		i18n.setLocale( data.locale );
	} );

	afterEach( function() {
		i18n.configure(); // ensure everything is reset
	} );

	describe( 'setLocale()', function() {
		describe( 'adding a new locale source from the same language', function() {
			beforeEach( function() {
				i18n.setLocale( {
					'': data.locale[ '' ],
					test1: [ 'translation1-1' ],
					test2: [ 'translation2' ],
					'new translation': [ 'Neue Übersetzung' ],
				} );
			} );

			it( 'should make the new translations available', function() {
				expect( translate( 'new translation' ) ).toBe( 'Neue Übersetzung' );
			} );
			it( 'should keep the original translations available as well', function() {
				expect( translate( 'Activate' ) ).toBe( 'Aktivieren' );
			} );
			it( 'should replace existing translations with the new version', function() {
				expect( translate( 'test1' ) ).toBe( 'translation1-1' );
				expect( translate( 'test2' ) ).toBe( 'translation2' );
			} );
		} );

		describe( 'adding a new locale source from a different language', function() {
			beforeEach( function() {
				i18n.setLocale( {
					'': Object.assign( {}, data.locale[ '' ], {
						localeSlug: 'fr',
						'Plural-Forms': 'nplurals=2; plural=n > 1;',
					} ),
					test1: [ 'traduction1' ],
					test2: [ 'traduction2' ],
					'new translation': [ 'nouvelle traduction' ],
				} );
			} );

			it( 'should make replace previous locale translations', function() {
				expect( translate( 'test1' ) ).not.toBe( 'translation1' );
				expect( translate( 'test1' ) ).toBe( 'traduction1' );
			} );
			it( 'should make old translations unavailable', function() {
				expect( translate( 'Activate' ) ).toBe( 'Activate' );
			} );
			it( 'should make new translations available', function() {
				expect( translate( 'new translation' ) ).toBe( 'nouvelle traduction' );
			} );
		} );
	} );

	describe( 'translate()', function() {
		describe( 'passing a string', function() {
			it( 'should find a simple translation', function() {
				expect( translate( 'test1' ) ).toBe( 'translation1' );
			} );
			it( 'should fall back to original string if translation is missing', function() {
				expect( translate( 'test2' ) ).toBe( 'test2' );
			} );
			it( "should fall back to original if translation isn't even null in locale file", function() {
				expect( translate( 'nonexisting-string' ) ).toBe( 'nonexisting-string' );
			} );
		} );

		describe( 'translate with context', function() {
			it( 'should find a string with context', function() {
				expect( translate( { original: 'test3', context: 'thecontext' } ) ).toBe( 'translation3' );
			} );
			it( 'should allow original text as options attribute or initial argument', function() {
				expect( translate( 'test3', { context: 'thecontext' } ) ).toBe( 'translation3' );
			} );
		} );

		describe( 'translate with comments', function() {
			it( 'should find a string with comment', function() {
				expect( translate( { original: 'test4', comment: 'thecomment' } ) ).toBe( 'translation4' );
			} );
			it( 'should allow original text as options attribute or initial argument', function() {
				expect( translate( 'test4', { comment: 'thecomment' } ) ).toBe( 'translation4' );
			} );
		} );

		describe( 'plural translation', function() {
			it( 'should use the singular form for one item', function() {
				expect(
					translate( {
						original: { single: 'plural-test', plural: 'plural-test pl key', count: 1 },
					} )
				).toBe( 'plural-test singular translation' );
			} );
			it( 'should use the plural form for > one items', function() {
				expect(
					translate( {
						original: { single: 'plural-test', plural: 'plural-test pl key', count: 2 },
					} )
				).toBe( 'plural-test multiple translation' );
			} );
			it( 'should honor the new plural translation syntax (singular test)', function() {
				expect(
					translate( 'plural-test new syntax', 'plural-test new syntaxes', { count: 1 } )
				).toBe( 'plural-test new syntax translated, single' );
			} );
			it( 'should honor the new plural translation syntax (plural test)', function() {
				expect(
					translate( 'plural-test new syntax', 'plural-test new syntaxes', {
						count: 2,
					} )
				).toBe( 'plural-test new syntax translated, plural' );
			} );
		} );

		describe( 'sprintf-style value interpolation', function() {
			it( 'should substitute a string', function() {
				expect( translate( 'foo %(test)s', { args: { test: 'bar' } } ) ).toBe( 'foo bar' );
			} );
			it( 'should substitute a number', function() {
				expect( translate( 'foo %(test)d', { args: { test: 1 } } ) ).toBe( 'foo 1' );
			} );
			it( 'should substitute floats', function() {
				expect( translate( 'foo %(test)f', { args: { test: 1.005 } } ) ).toBe( 'foo 1.005' );
			} );
			it( 'should allow passing an array of arguments', function() {
				expect( translate( 'test1 %1$s test3 %2$s', { args: [ 'test2', 'test4' ] } ) ).toBe(
					'test1 test2 test3 test4'
				);
			} );
			it( 'should allow passing a single argument', function() {
				expect( translate( 'test1 %s test3', { args: 'test2' } ) ).toBe( 'test1 test2 test3' );
			} );
			it( 'should not throw when passed a circular object', function() {
				const obj = {
					foo: 'bar',
					toString: function() {
						return 'baz';
					},
				};
				obj.obj = obj;
				expect( translate( 'test1 %s', { args: obj } ) ).toBe( 'test1 baz' );
			} );
		} );

		describe( 'with mixed components', function() {
			it( 'should handle sprintf and component interpolation together', function() {
				const input = React.createElement( 'input' ),
					expectedResultString = '<span>foo <input/> bar</span>',
					placeholder = 'bar',
					translatedComponent = translate( 'foo {{ input /}} %(placeholder)s', {
						components: {
							input: input,
						},
						args: {
							placeholder: placeholder,
						},
					} ),
					instance = React.createElement( 'span', null, translatedComponent );

				expect( stripReactAttributes( ReactDomServer.renderToStaticMarkup( instance ) ) ).toBe(
					expectedResultString
				);
			} );
		} );

		describe( 'adding new translations', function() {
			it( 'should find a new translation after it has been added', function() {
				i18n.addTranslations( {
					'test-does-not-exist': [ 'translation3' ],
				} );

				expect( translate( 'test-does-not-exist' ) ).toBe( 'translation3' );
			} );
			it( 'should return the new translation if it has been overwritten', function() {
				i18n.addTranslations( {
					'test-will-overwrite': [ 'not-translation1' ],
				} );

				expect( translate( 'test-will-overwrite' ) ).toBe( 'not-translation1' );
			} );
		} );
	} );

	describe( 'moment()', function() {
		describe( 'generating date strings', function() {
			it( 'should know the short weekdays', function() {
				expect( moment( '2014-07-18' ).format( 'dd' ) ).toBe( 'Fr' );
			} );
			it( 'should use available translations for date format', function() {
				expect(
					moment( '2014-07-18T14:59:09-07:00' )
						.utcOffset( '+00:00' )
						.format( 'LLLL' )
				).toBe( 'Freitag, 18. Juli 2014 21:59' );
			} );
			it( 'should use available translations for relative time in the past', function() {
				expect(
					moment()
						.subtract( 3, 'hours' )
						.fromNow()
				).toBe( 'vor 3 Stunden' );
			} );
			it( 'should use available translations for relative time in the future', function() {
				expect(
					moment()
						.add( 10, 'seconds' )
						.fromNow()
				).toBe( 'in ein paar Sekunden' );
			} );
			it( 'should be able to convert dates to any timezone', function() {
				expect(
					moment( '2014-07-18T14:59:09-07:00' )
						.tz( 'America/Los_Angeles' )
						.format( 'LLLL' )
				).toBe( 'Freitag, 18. Juli 2014 14:59' );
				expect(
					moment( '2014-07-18T14:59:09-07:00' )
						.tz( 'Asia/Tokyo' )
						.format( 'LLLL' )
				).toBe( 'Samstag, 19. Juli 2014 06:59' );
				expect(
					moment( '2014-07-18T14:59:09-07:00' )
						.tz( 'Europe/Paris' )
						.format( 'LLLL' )
				).toBe( 'Freitag, 18. Juli 2014 23:59' );
				expect(
					moment( '2014-07-18T14:59:09-07:00' )
						.tz( 'Europe/London' )
						.format( 'LLLL' )
				).toBe( 'Freitag, 18. Juli 2014 22:59' );
			} );
		} );
	} );

	describe( 'numberFormat()', function() {
		describe( 'default numberFormat', function() {
			it( 'should truncate decimals', function() {
				expect( numberFormat( 150.15 ) ).toBe( '150' );
			} );
			it( 'should round up', function() {
				expect( numberFormat( 150.5 ) ).toBe( '151' );
			} );
			it( 'should default to locale thousands separator (. for German in test)', function() {
				expect( numberFormat( 1500 ) ).toBe( '1.500' );
			} );
		} );

		describe( 'with decimal', function() {
			it( 'should default to locale decimal separator (, for German in test)', function() {
				expect( numberFormat( 150, 2 ) ).toBe( '150,00' );
			} );
			it( 'should truncate to specified decimal', function() {
				expect( numberFormat( 150.312, 2 ) ).toBe( '150,31' );
			} );
			it( 'should accept decimal as argument or object attribute', function() {
				expect(
					numberFormat( 150, {
						decimals: 2,
					} )
				).toBe( '150,00' );
			} );
		} );

		describe( 'overriding defaults', function() {
			it( 'should allow overriding of locale decimal and thousands separators', function() {
				expect(
					numberFormat( 2500.33, {
						decimals: 3,
						thousandsSep: '*',
						decPoint: '@',
					} )
				).toBe( '2*500@330' );
			} );
		} );
	} );

	describe( 'hashed locale data', function() {
		it( 'should find keys when looked up by simple hash', function() {
			i18n.setLocale( {
				'': {
					localeSlug: 'xx-pig-latin',
					'key-hash': 'sha1',
				},
				'0f7d0d088b6ea936fb25b477722d734706fe8b40': [ 'implesa' ],
			} );
			expect( translate( 'simple' ) ).toBe( 'implesa' );
		} );

		it( 'should find keys when looked up by single length hash', function() {
			i18n.setLocale( {
				'': {
					localeSlug: 'xx-pig-latin',
					'key-hash': 'sha1-1',
				},
				'0': [ 'implesa' ],
			} );
			expect( translate( 'simple' ) ).toBe( 'implesa' );
		} );

		it( 'should find keys when looked up by multi length hash', function() {
			i18n.setLocale( {
				'': {
					localeSlug: 'xx-pig-latin',
					'key-hash': 'sha1-1-2',
				},
				'0': [ 'implesa' ],
				'78': [ 'edra' ], // red has a sha1 of 78988010b890ce6f4d2136481f392787ec6d6106
				'7d': [ 'reyga' ], // grey has a sha1 of 7d1f8f911da92c0ea535cad461fd773281a79638
			} );
			expect( translate( 'simple' ) ).toBe( 'implesa' );
			expect( translate( 'red' ) ).toBe( 'edra' );
			expect( translate( 'grey' ) ).toBe( 'reyga' );
		} );
	} );
} );
