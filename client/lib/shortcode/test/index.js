/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import Shortcode from '../';

describe( 'index', function() {
	describe( '#parseAttributes()', function() {
		it( 'should parse a string of named attributes', function() {
			var result = Shortcode.parseAttributes( 'bar="baz"' );

			expect( result ).to.eql( {
				named: {
					bar: 'baz'
				},
				numeric: []
			} );
		} );

		it( 'should parse a string of numeric attributes', function() {
			var result = Shortcode.parseAttributes( 'bar baz' );

			expect( result ).to.eql( {
				named: {},
				numeric: [ 'bar', 'baz' ]
			} );
		} );

		it( 'should parse a string of mixed attributes', function() {
			var result = Shortcode.parseAttributes( 'bar="baz" qux' );

			expect( result ).to.eql( {
				named: {
					bar: 'baz'
				},
				numeric: [ 'qux' ]
			} );
		} );
	} );

	describe( '#normalizeAttributes()', function() {
		it( 'should normalize a string of named attributes', function() {
			var result = Shortcode.normalizeAttributes( 'bar="baz"' );

			expect( result ).to.eql( {
				named: {
					bar: 'baz'
				},
				numeric: []
			} );
		} );

		it( 'should normalize a string of numeric attributes', function() {
			var result = Shortcode.normalizeAttributes( 'bar' );

			expect( result ).to.eql( {
				named: {},
				numeric: [ 'bar' ]
			} );
		} );

		it( 'should normalize a string of mixed attributes', function() {
			var result = Shortcode.normalizeAttributes( 'bar="baz" qux' );

			expect( result ).to.eql( {
				named: {
					bar: 'baz'
				},
				numeric: [ 'qux' ]
			} );
		} );

		it( 'should normalize an array as numeric attributes', function() {
			var result = Shortcode.normalizeAttributes( [ 'bar' ] );

			expect( result ).to.eql( {
				named: {},
				numeric: [ 'bar' ]
			} );
		} );

		it( 'should explicitly return an object of already split attributes', function() {
			var attributes = {
					named: { bar: 'baz' },
					numeric: [ 'qux' ]
				}, result = Shortcode.normalizeAttributes( attributes );

			expect( result ).to.eql( attributes );
		} );

		it( 'should normalize an object as the named attributes', function() {
			var attributes = { bar: 'baz' },
				result = Shortcode.normalizeAttributes( attributes );

			expect( result ).to.eql( {
				named: attributes,
				numeric: []
			} );
		} );
	} );

	describe( '#stringify()', function() {
		it( 'should generate a closed shortcode when only the tag is specified', function() {
			var result = Shortcode.stringify( {
				tag: 'foo'
			} );

			expect( result ).to.equal( '[foo][/foo]' );
		} );

		it( 'should accept an object of named attributes', function() {
			var result = Shortcode.stringify( {
				tag: 'foo',
				attrs: {
					bar: 'baz'
				}
			} );

			expect( result ).to.equal( '[foo bar="baz"][/foo]' );
		} );

		it( 'should accept an array of numeric attributes', function() {
			var result = Shortcode.stringify( {
				tag: 'foo',
				attrs: [ 'bar' ]
			} );

			expect( result ).to.equal( '[foo bar][/foo]' );
		} );

		it( 'should accept an object of mixed attributes', function() {
			var result = Shortcode.stringify( {
				tag: 'foo',
				attrs: {
					named: { bar: 'baz' },
					numeric: [ 'qux' ]
				}
			} );

			expect( result ).to.equal( '[foo bar="baz" qux][/foo]' );
		} );

		it( 'should omit the closing tag for single type', function() {
			var result = Shortcode.stringify( {
				tag: 'foo',
				type: 'single'
			} );

			expect( result ).to.equal( '[foo]' );
		} );

		it( 'should self-close for self-closing type', function() {
			var result = Shortcode.stringify( {
				tag: 'foo',
				type: 'self-closing'
			} );

			expect( result ).to.equal( '[foo /]' );
		} );

		it( 'should include content between the opening and closing tags', function() {
			var result = Shortcode.stringify( {
				tag: 'foo',
				content: 'Bar'
			} );

			expect( result ).to.equal( '[foo]Bar[/foo]' );
		} );
	} );

	describe( '#parse()', function() {
		it( 'should interpret a closed shortcode', function() {
			var result = Shortcode.parse( '[foo][/foo]' );

			expect( result ).to.eql( {
				tag: 'foo',
				type: 'closed'
			} );
		} );

		it( 'should interpret a shortcode with named attributes', function() {
			var result = Shortcode.parse( '[foo bar="baz"][/foo]' );

			expect( result ).to.eql( {
				tag: 'foo',
				type: 'closed',
				attrs: {
					named: {
						bar: 'baz'
					},
					numeric: []
				}
			} );
		} );

		it( 'should interpret a shortcode with numeric attributes', function() {
			var result = Shortcode.parse( '[foo bar][/foo]' );

			expect( result ).to.eql( {
				tag: 'foo',
				type: 'closed',
				attrs: {
					named: {},
					numeric: [ 'bar' ]
				}
			} );
		} );

		it( 'should interpret a shortcode with mixed attributes', function() {
			var result = Shortcode.parse( '[foo bar="baz" qux][/foo]' );

			expect( result ).to.eql( {
				tag: 'foo',
				type: 'closed',
				attrs: {
					named: {
						bar: 'baz'
					},
					numeric: [ 'qux' ]
				}
			} );
		} );

		it( 'should interpret a single type shortcode', function() {
			var result = Shortcode.parse( '[foo]' );

			expect( result ).to.eql( {
				tag: 'foo',
				type: 'single'
			} );
		} );

		it( 'should interpret a self-closing shortcode', function() {
			var result = Shortcode.parse( '[foo /]' );

			expect( result ).to.eql( {
				tag: 'foo',
				type: 'self-closing'
			} );
		} );

		it( 'should interpret a shortcode with content', function() {
			var result = Shortcode.parse( '[foo]Bar[/foo]' );

			expect( result ).to.eql( {
				tag: 'foo',
				type: 'closed',
				content: 'Bar'
			} );
		} );
	} );
} );
