/**
 * @jest-environment jsdom
 */

/**
 * Internal dependencies
 */
import highlight from '../';

/**
 * External dependencies
 */
import { expect } from 'chai';

describe( 'highlight', () => {
	describe( 'unit test', () => {
		test( "should return html as is if there's no term", () => {
			expect( highlight( '', 'lorem ipsum hello world' ) ).to.equal( 'lorem ipsum hello world' );
		} );

		test( 'should wrap the term with <mark> when no custom wrapper node is defined', () => {
			expect( highlight( 'hello', 'lorem ipsum hello world' ) ).to.contain(
				'lorem ipsum <mark>hello</mark> world'
			);
		} );

		test( 'should wrap the term with the custom wrapper node when provided', () => {
			const span = document.createElement( 'span' );
			span.setAttribute( 'class', 'marker' );
			expect( highlight( 'hello', 'hello world', span ) ).to.contain(
				'<span class="marker">hello</span> world'
			);
		} );

		test( 'should wrap case-insensitively, within a single word, with multiple matches, over multiple lines', () => {
			expect( highlight( 'HEllO', 'merhabaHEllO\nselamHEllOdunya' ) ).to.contain(
				'merhaba<mark>HEllO</mark>\nselam<mark>HEllO</mark>dunya'
			);
		} );

		test( 'should be able to handle html elements with children and text nodes', () => {
			expect( highlight( 'hello', '<div>hello world<span>hello world</span></div>' ) ).to.contain(
				'<div><mark>hello</mark> world<span><mark>hello</mark> world</span></div>'
			);
		} );
	} );

	describe( 'edge cases', () => {
		describe( 'unicode', () => {
			test( 'should wrap when the text and query contains unicode chars', () => {
				expect( highlight( 'üşiöqç', 'lorem ıpsum üşiöqç' ) ).to.contain(
					'lorem ıpsum <mark>üşiöqç</mark>'
				);
			} );
		} );

		describe( 'html', () => {
			test( 'should not match parts of html tags', () => {
				expect( highlight( 'img', 'hello<img src="/"> world' ) ).to.contain(
					'hello<img src="/"> world'
				);
			} );

			test( 'should prevent html tag injection', () => {
				expect( highlight( 'script', '<script></script>' ) ).to.contain( '<script></script>' );
			} );

			test( 'should prevent html attribute injection', () => {
				expect( highlight( 'href', '<a href="/hello">hello</a>' ) ).to.contain(
					'<a href="/hello">hello</a>'
				);
			} );
		} );
	} );
} );
