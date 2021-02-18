/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { normalizeAttributes, parse, parseAttributes, stringify } from '../index';

describe( 'index', () => {
	describe( '#parseAttributes()', () => {
		test( 'should parse a string of named attributes', () => {
			expect( parseAttributes( 'bar="baz"' ) ).to.eql( {
				named: {
					bar: 'baz',
				},
				numeric: [],
			} );
		} );

		test( 'should parse a string of numeric attributes', () => {
			expect( parseAttributes( 'bar baz' ) ).to.eql( {
				named: {},
				numeric: [ 'bar', 'baz' ],
			} );
		} );

		test( 'should parse a string of mixed attributes', () => {
			expect( parseAttributes( 'bar="baz" qux' ) ).to.eql( {
				named: {
					bar: 'baz',
				},
				numeric: [ 'qux' ],
			} );
		} );
	} );

	describe( '#normalizeAttributes()', () => {
		test( 'should normalize a string of named attributes', () => {
			expect( normalizeAttributes( 'bar="baz"' ) ).to.eql( {
				named: {
					bar: 'baz',
				},
				numeric: [],
			} );
		} );

		test( 'should normalize a string of numeric attributes', () => {
			expect( normalizeAttributes( 'bar' ) ).to.eql( {
				named: {},
				numeric: [ 'bar' ],
			} );
		} );

		test( 'should normalize a string of mixed attributes', () => {
			expect( normalizeAttributes( 'bar="baz" qux' ) ).to.eql( {
				named: {
					bar: 'baz',
				},
				numeric: [ 'qux' ],
			} );
		} );

		test( 'should normalize an array as numeric attributes', () => {
			expect( normalizeAttributes( [ 'bar' ] ) ).to.eql( {
				named: {},
				numeric: [ 'bar' ],
			} );
		} );

		test( 'should explicitly return an object of already split attributes', () => {
			const attributes = {
				named: { bar: 'baz' },
				numeric: [ 'qux' ],
			};

			expect( normalizeAttributes( attributes ) ).to.eql( attributes );
		} );

		test( 'should normalize an object as the named attributes', () => {
			const attributes = { bar: 'baz' };

			expect( normalizeAttributes( attributes ) ).to.eql( {
				named: attributes,
				numeric: [],
			} );
		} );
	} );

	describe( '#stringify()', () => {
		test( 'should generate a closed shortcode when only the tag is specified', () => {
			expect(
				stringify( {
					tag: 'foo',
				} )
			).to.equal( '[foo][/foo]' );
		} );

		test( 'should accept an object of named attributes', () => {
			expect(
				stringify( {
					tag: 'foo',
					attrs: {
						bar: 'baz',
					},
				} )
			).to.equal( '[foo bar="baz"][/foo]' );
		} );

		test( 'should accept an array of numeric attributes', () => {
			expect(
				stringify( {
					tag: 'foo',
					attrs: [ 'bar' ],
				} )
			).to.equal( '[foo bar][/foo]' );
		} );

		test( 'should accept an object of mixed attributes', () => {
			expect(
				stringify( {
					tag: 'foo',
					attrs: {
						named: { bar: 'baz' },
						numeric: [ 'qux' ],
					},
				} )
			).to.equal( '[foo bar="baz" qux][/foo]' );
		} );

		test( 'should omit the closing tag for single type', () => {
			expect(
				stringify( {
					tag: 'foo',
					type: 'single',
				} )
			).to.equal( '[foo]' );
		} );

		test( 'should self-close for self-closing type', () => {
			expect(
				stringify( {
					tag: 'foo',
					type: 'self-closing',
				} )
			).to.equal( '[foo /]' );
		} );

		test( 'should include content between the opening and closing tags', () => {
			expect(
				stringify( {
					tag: 'foo',
					content: 'Bar',
				} )
			).to.equal( '[foo]Bar[/foo]' );
		} );
	} );

	describe( '#parse()', () => {
		test( 'should interpret a closed shortcode', () => {
			expect( parse( '[foo][/foo]' ) ).to.eql( {
				tag: 'foo',
				type: 'closed',
			} );
		} );

		test( 'should interpret a shortcode with named attributes', () => {
			expect( parse( '[foo bar="baz"][/foo]' ) ).to.eql( {
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
			expect( parse( '[foo bar][/foo]' ) ).to.eql( {
				tag: 'foo',
				type: 'closed',
				attrs: {
					named: {},
					numeric: [ 'bar' ],
				},
			} );
		} );

		test( 'should interpret a shortcode with mixed attributes', () => {
			expect( parse( '[foo bar="baz" qux][/foo]' ) ).to.eql( {
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
			expect( parse( '[foo]' ) ).to.eql( {
				tag: 'foo',
				type: 'single',
			} );
		} );

		test( 'should interpret a self-closing shortcode', () => {
			expect( parse( '[foo /]' ) ).to.eql( {
				tag: 'foo',
				type: 'self-closing',
			} );
		} );

		test( 'should interpret a shortcode with content', () => {
			expect( parse( '[foo]Bar[/foo]' ) ).to.eql( {
				tag: 'foo',
				type: 'closed',
				content: 'Bar',
			} );
		} );
	} );
} );
