/** @jest-environment jsdom */

/**
 * External dependencies
 */
var chai = require( 'chai' ),
	expect = chai.expect;

/**
 * Internal dependencies
 */
import highlight from '../';

describe( 'highlight', function() {
	context( 'unit test', function() {
		it( 'should return html as is if there\'s no term', function() {
			expect( highlight( '', 'lorem ipsum hello world' ) )
				.to.equal( 'lorem ipsum hello world' );
		} );

		it( 'should wrap the term with <mark> when no custom wrapper node is defined', function() {
			expect( highlight( 'hello', 'lorem ipsum hello world' ) )
				.to.contain( 'lorem ipsum <mark>hello</mark> world' );
		} );

		it( 'should wrap the term with the custom wrapper node when provided', function() {
			var span = document.createElement( 'span' );
			span.setAttribute( 'class', 'marker' );
			expect( highlight( 'hello', 'hello world', span ) )
				.to.contain( '<span class="marker">hello</span> world' );
		} );

		it( 'should wrap case-insensitively, within a single word, with multiple matches, over multiple lines',
			function() {
				expect( highlight( 'HEllO', 'merhabaHEllO\nselamHEllOdunya' ) )
					.to.contain( 'merhaba<mark>HEllO</mark>\nselam<mark>HEllO</mark>dunya' );
			} );

		it( 'should be able to handle html elements with children and text nodes', function() {
			expect( highlight( 'hello', '<div>hello world<span>hello world</span></div>' ) )
				.to.contain( '<div><mark>hello</mark> world<span><mark>hello</mark> world</span></div>' );
		} );
	} );

	context( 'edge cases', function() {
		context( 'unicode', function() {
			it( 'should wrap when the text and query contains unicode chars', function() {
				expect( highlight( 'üşiöqç', 'lorem ıpsum üşiöqç' ) )
					.to.contain( 'lorem ıpsum <mark>üşiöqç</mark>' );
			} );
		} );

		context( 'html', function() {
			it( 'should not match parts of html tags', function() {
				expect( highlight( 'img', 'hello<img src="/"> world' ) )
					.to.contain( 'hello<img src="/"> world' );
			} );

			it( 'should prevent html tag injection', function() {
				expect( highlight( 'script', '<script></script>' ) )
					.to.contain( '<script></script>' );
			} );

			it( 'should prevent html attribute injection', function() {
				expect( highlight( 'href', '<a href="/hello">hello</a>' ) )
					.to.contain( '<a href="/hello">hello</a>' );
			} );
		} );
	} );
} );

