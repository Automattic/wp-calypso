/**
 * Internal dependencies
 */
import { next, replace, attrs } from '../';

describe( 'shortcode', () => {
	describe( 'next', () => {
		it( 'should find the shortcode', () => {
			const result = next( 'foo', 'this has the [foo] shortcode' );
			expect( result.index ).toBe( 13 );
		} );

		it( 'should find the shortcode with attributes', () => {
			const result = next( 'foo', 'this has the [foo param="foo"] shortcode' );
			expect( result.index ).toBe( 13 );
		} );

		it( 'should not find shortcodes that are not there', () => {
			const result = next( 'bar', 'this has the [foo] shortcode' );
			expect( result ).toBe( undefined );
		} );

		it( 'should not find shortcodes with attributes that are not there', () => {
			const result = next( 'bar', 'this has the [foo param="bar"] shortcode' );
			expect( result ).toBe( undefined );
		} );

		it( 'should find the shortcode when told to start looking beyond the start of the string', () => {
			const result1 = next( 'foo', 'this has the [foo] shortcode', 12 );
			expect( result1.index ).toBe( 13 );

			const result2 = next( 'foo', 'this has the [foo] shortcode', 13 );
			expect( result2.index ).toBe( 13 );

			const result3 = next( 'foo', 'this has the [foo] shortcode', 14 );
			expect( result3 ).toBe( undefined );
		} );

		it( 'should find the second instances of the shortcode when the starting indice is after the start of the first one', () => {
			const result = next( 'foo', 'this has the [foo] shortcode [foo] twice', 14 );
			expect( result.index ).toBe( 29 );
		} );

		it( 'should not find escaped shortcodes', () => {
			const result = next( 'foo', 'this has the [[foo]] shortcode' );
			expect( result ).toBe( undefined );
		} );

		it( 'should not find escaped shortcodes with attributes', () => {
			const result = next( 'foo', 'this has the [[foo param="foo"]] shortcode' );
			expect( result ).toBe( undefined );
		} );

		it( 'should find shortcodes that are incorrectly escaped by newlines', () => {
			const result1 = next( 'foo', 'this has the [\n[foo]] shortcode' );
			expect( result1.index ).toBe( 15 );

			const result2 = next( 'foo', 'this has the [[foo]\n] shortcode' );
			expect( result2.index ).toBe( 14 );
		} );

		it( 'should still work when there are not equal ammounts of square brackets', () => {
			const result1 = next( 'foo', 'this has the [[foo] shortcode' );
			expect( result1.index ).toBe( 14 );

			const result2 = next( 'foo', 'this has the [foo]] shortcode' );
			expect( result2.index ).toBe( 13 );
		} );

		it( 'should find the second instances of the shortcode when the first one is escaped', () => {
			const result = next( 'foo', 'this has the [[foo]] shortcode [foo] twice' );
			expect( result.index ).toBe( 31 );
		} );

		it( 'should not find shortcodes that are not full matches', () => {
			const result1 = next( 'foo', 'this has the [foobar] shortcode' );
			expect( result1 ).toBe( undefined );

			const result2 = next( 'foobar', 'this has the [foo] shortcode' );
			expect( result2 ).toBe( undefined );
		} );
	} );

	describe( 'replace', () => {
		it( 'should replace the shortcode', () => {
			const result1 = replace( 'foo', 'this has the [foo] shortcode', () => 'bar' );
			expect( result1 ).toBe( 'this has the bar shortcode' );

			const result2 = replace( 'foo', 'this has the [foo param="foo"] shortcode', () => 'bar' );
			expect( result2 ).toBe( 'this has the bar shortcode' );
		} );

		it( 'should not replace the shortcode when it does not match', () => {
			const result1 = replace( 'bar', 'this has the [foo] shortcode', () => 'bar' );
			expect( result1 ).toBe( 'this has the [foo] shortcode' );

			const result2 = replace( 'bar', 'this has the [foo param="bar"] shortcode', () => 'bar' );
			expect( result2 ).toBe( 'this has the [foo param="bar"] shortcode' );
		} );

		it( 'should replace the shortcode in all instances of its use', () => {
			const result1 = replace( 'foo', 'this has the [foo] shortcode [foo] twice', () => 'bar' );
			expect( result1 ).toBe( 'this has the bar shortcode bar twice' );

			const result2 = replace( 'foo', 'this has the [foo param="foo"] shortcode [foo] twice', () => 'bar' );
			expect( result2 ).toBe( 'this has the bar shortcode bar twice' );
		} );

		it( 'should not replace the escaped shortcodes', () => {
			const result1 = replace( 'foo', 'this has the [[foo]] shortcode', () => 'bar' );
			expect( result1 ).toBe( 'this has the [[foo]] shortcode' );

			const result2 = replace( 'foo', 'this has the [[foo param="bar"]] shortcode', () => 'bar' );
			expect( result2 ).toBe( 'this has the [[foo param="bar"]] shortcode' );

			const result3 = replace( 'foo', 'this [foo] has the [[foo param="bar"]] shortcode escaped', () => 'bar' );
			expect( result3 ).toBe( 'this bar has the [[foo param="bar"]] shortcode escaped' );
		} );

		it( 'should replace improperly escaped shortcodes that include newlines', () => {
			const result1 = replace( 'foo', 'this [foo] has the [[foo param="bar"]\n] shortcode ', () => 'bar' );
			expect( result1 ).toBe( 'this bar has the [bar\n] shortcode ' );

			const result2 = replace( 'foo', 'this [foo] has the [\n[foo param="bar"]] shortcode ', () => 'bar' );
			expect( result2 ).toBe( 'this bar has the [\nbar] shortcode ' );
		} );

		it( 'should not replace the shortcode when it is an incomplete match', () => {
			const result1 = replace( 'foo', 'this has the [foobar] shortcode', () => 'bar' );
			expect( result1 ).toBe( 'this has the [foobar] shortcode' );

			const result2 = replace( 'foobar', 'this has the [foo] shortcode', () => 'bar' );
			expect( result2 ).toBe( 'this has the [foo] shortcode' );
		} );
	} );

	describe( 'attrs', () => {
		it( 'should return named attributes created with single, double, and no quotes', () => {
			const result = attrs( 'param="foo" another=\'bar\' andagain=baz' );
			const expected = {
				named: {
					param: 'foo',
					another: 'bar',
					andagain: 'baz',
				},
				numeric: [],
			};

			expect( result ).toEqual( expected );
		} );

		it( 'should return numeric attributes in the order they are used', () => {
			const result = attrs( 'foo bar baz' );
			const expected = {
				named: {},
				numeric: [ 'foo', 'bar', 'baz' ],
			};

			expect( result ).toEqual( expected );
		} );

		it( 'should return numeric attributes in the order they are used when they have named attributes in between', () => {
			const result = attrs( 'foo not="a blocker" bar baz' );
			const expected = {
				named: {
					not: 'a blocker',
				},
				numeric: [ 'foo', 'bar', 'baz' ],
			};

			expect( result ).toEqual( expected );
		} );

		it( 'should return numeric attributes created with single, double, and no quotes', () => {
			const result = attrs( 'foo "bar" \'baz\'' );
			const expected = {
				named: {},
				numeric: [ 'foo', 'bar', 'baz' ],
			};

			expect( result ).toEqual( expected );
		} );

		it( 'should return mixed attributes created with single, double, and no quotes', () => {
			const result = attrs( 'a="foo" b=\'bar\' c=baz foo "bar" \'baz\'' );
			const expected = {
				named: {
					a: 'foo',
					b: 'bar',
					c: 'baz',
				},
				numeric: [ 'foo', 'bar', 'baz' ],
			};

			expect( result ).toEqual( expected );
		} );
	} );
} );
