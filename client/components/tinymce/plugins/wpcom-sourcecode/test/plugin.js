/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import useMockery from 'test/helpers/use-mockery';

describe( 'wpcom-sourcecode', () => {
	let wrapPre, unwrapPre;

	useMockery( mockery => {
		mockery.registerMock( 'tinymce/tinymce', {} );

		const plugin = require( '../plugin' );
		wrapPre = plugin.wrapPre;
		unwrapPre = plugin.unwrapPre;
	} );

	describe( '#wrapPre()', () => {
		it( 'should wrap a code shortcode', () => {
			const wrapped = wrapPre( '[code lang="javascript"]var foo;[/code]' );
			expect( wrapped ).to.equal( '<pre>[code lang="javascript"]var foo;[/code]</pre>' );
		} );

		it( 'should wrap a sourcecode shortcode', () => {
			const wrapped = wrapPre( '[sourcecode lang="javascript"]var foo;[/sourcecode]' );
			expect( wrapped ).to.equal( '<pre>[sourcecode lang="javascript"]var foo;[/sourcecode]</pre>' );
		} );
	} );

	describe( '#unwrapPre()', () => {
		it( 'should unwrap a code shortcode', () => {
			const unwrapped = unwrapPre( '<pre>[code lang="javascript"]var foo;[/code]</pre>' );
			expect( unwrapped ).to.equal( '<p>[code lang="javascript"]var foo;[/code]</p>' );
		} );

		it( 'should unwrap a sourcecode shortcode', () => {
			const unwrapped = unwrapPre( '<pre>[sourcecode lang="javascript"]var foo;[/sourcecode]</pre>' );
			expect( unwrapped ).to.equal( '<p>[sourcecode lang="javascript"]var foo;[/sourcecode]</p>' );
		} );

		it( 'should gracefully handle surrounding content', () => {
			const unwrapped = unwrapPre( '<p>foo</p><p><pre>[sourcecode lang="javascript"]var foo;[/sourcecode]</pre></p><p>bar</p>' );
			expect( unwrapped ).to.equal( '<p>foo</p><p>[sourcecode lang="javascript"]var foo;[/sourcecode]</p><p>bar</p>' );
		} );
	} );
} );
