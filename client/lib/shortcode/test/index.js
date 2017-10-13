/** @format */

/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import Shortcode from '../';

describe( 'index', () => {
	describe( '#parseAttributes()', () => {
		test( 'should parse a string of named attributes', () => {
			var result = Shortcode.parseAttributes( 'bar="baz"' );

			expect( result ).to.eql( {
				named: {
					bar: 'baz',
				},
				numeric: [],
			} );
		} );

		test( 'should parse a string of numeric attributes', () => {
			var result = Shortcode.parseAttributes( 'bar baz' );

			expect( result ).to.eql( {
				named: {},
				numeric: [ 'bar', 'baz' ],
			} );
		} );

		test( 'should parse a string of mixed attributes', () => {
			var result = Shortcode.parseAttributes( 'bar="baz" qux' );

			expect( result ).to.eql( {
				named: {
					bar: 'baz',
				},
				numeric: [ 'qux' ],
			} );
		} );
	} );

	describe( '#normalizeAttributes()', () => {
		test( 'should normalize a string of named attributes', () => {
			var result = Shortcode.normalizeAttributes( 'bar="baz"' );

			expect( result ).to.eql( {
				named: {
					bar: 'baz',
				},
				numeric: [],
			} );
		} );

		test( 'should normalize a string of numeric attributes', () => {
			var result = Shortcode.normalizeAttributes( 'bar' );

			expect( result ).to.eql( {
				named: {},
				numeric: [ 'bar' ],
			} );
		} );

		test( 'should normalize a string of mixed attributes', () => {
			var result = Shortcode.normalizeAttributes( 'bar="baz" qux' );

			expect( result ).to.eql( {
				named: {
					bar: 'baz',
				},
				numeric: [ 'qux' ],
			} );
		} );

		test( 'should normalize an array as numeric attributes', () => {
			var result = Shortcode.normalizeAttributes( [ 'bar' ] );

			expect( result ).to.eql( {
				named: {},
				numeric: [ 'bar' ],
			} );
		} );

		test( 'should explicitly return an object of already split attributes', () => {
			var attributes = {
					named: { bar: 'baz' },
					numeric: [ 'qux' ],
				},
				result = Shortcode.normalizeAttributes( attributes );

			expect( result ).to.eql( attributes );
		} );

		test( 'should normalize an object as the named attributes', () => {
			var attributes = { bar: 'baz' },
				result = Shortcode.normalizeAttributes( attributes );

			expect( result ).to.eql( {
				named: attributes,
				numeric: [],
			} );
		} );
	} );

	describe( '#stringify()', () => {
		test( 'should generate a closed shortcode when only the tag is specified', () => {
			var result = Shortcode.stringify( {
				tag: 'foo',
			} );

			expect( result ).to.equal( '[foo][/foo]' );
		} );

		test( 'should accept an object of named attributes', () => {
			var result = Shortcode.stringify( {
				tag: 'foo',
				attrs: {
					bar: 'baz',
				},
			} );

			expect( result ).to.equal( '[foo bar="baz"][/foo]' );
		} );

		test( 'should accept an array of numeric attributes', () => {
			var result = Shortcode.stringify( {
				tag: 'foo',
				attrs: [ 'bar' ],
			} );

			expect( result ).to.equal( '[foo bar][/foo]' );
		} );

		test( 'should accept an object of mixed attributes', () => {
			var result = Shortcode.stringify( {
				tag: 'foo',
				attrs: {
					named: { bar: 'baz' },
					numeric: [ 'qux' ],
				},
			} );

			expect( result ).to.equal( '[foo bar="baz" qux][/foo]' );
		} );

		test( 'should omit the closing tag for single type', () => {
			var result = Shortcode.stringify( {
				tag: 'foo',
				type: 'single',
			} );

			expect( result ).to.equal( '[foo]' );
		} );

		test( 'should self-close for self-closing type', () => {
			var result = Shortcode.stringify( {
				tag: 'foo',
				type: 'self-closing',
			} );

			expect( result ).to.equal( '[foo /]' );
		} );

		test( 'should include content between the opening and closing tags', () => {
			var result = Shortcode.stringify( {
				tag: 'foo',
				content: 'Bar',
			} );

			expect( result ).to.equal( '[foo]Bar[/foo]' );
		} );
	} );

	describe( '#parse()', () => {
		test( 'should interpret a closed shortcode', () => {
			var result = Shortcode.parse( '[foo][/foo]' );

			expect( result ).to.eql( {
				tag: 'foo',
				type: 'closed',
			} );
		} );

		test( 'should interpret a shortcode with named attributes', () => {
			var result = Shortcode.parse( '[foo bar="baz"][/foo]' );

			expect( result ).to.eql( {
				tag: 'foo',
				type: 'closed',
				attrs: {
					named: {
						bar: 'baz',
					},
					numeric: [],
				},
			} );
		} );

		test( 'should interpret a shortcode with numeric attributes', () => {
			var result = Shortcode.parse( '[foo bar][/foo]' );

			expect( result ).to.eql( {
				tag: 'foo',
				type: 'closed',
				attrs: {
					named: {},
					numeric: [ 'bar' ],
				},
			} );
		} );

		test( 'should interpret a shortcode with mixed attributes', () => {
			var result = Shortcode.parse( '[foo bar="baz" qux][/foo]' );

			expect( result ).to.eql( {
				tag: 'foo',
				type: 'closed',
				attrs: {
					named: {
						bar: 'baz',
					},
					numeric: [ 'qux' ],
				},
			} );
		} );

		test( 'should interpret a single type shortcode', () => {
			var result = Shortcode.parse( '[foo]' );

			expect( result ).to.eql( {
				tag: 'foo',
				type: 'single',
			} );
		} );

		test( 'should interpret a self-closing shortcode', () => {
			var result = Shortcode.parse( '[foo /]' );

			expect( result ).to.eql( {
				tag: 'foo',
				type: 'self-closing',
			} );
		} );

		test( 'should interpret a shortcode with content', () => {
			var result = Shortcode.parse( '[foo]Bar[/foo]' );

			expect( result ).to.eql( {
				tag: 'foo',
				type: 'closed',
				content: 'Bar',
			} );
		} );
	} );
} );
