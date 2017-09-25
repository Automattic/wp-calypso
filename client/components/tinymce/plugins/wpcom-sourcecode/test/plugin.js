/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import useMockery from 'test/helpers/use-mockery';

import plugin from '../plugin';

describe( 'wpcom-sourcecode', () => {
	let wrapPre, unwrapPre;

	useMockery( mockery => {
	    mockery.registerMock( 'tinymce/tinymce', {} );

		wrapPre = plugin.wrapPre;
		unwrapPre = plugin.unwrapPre;
	} );

	describe( '#wrapPre()', () => {
		it( 'should wrap a code shortcode', () => {
			const wrapped = wrapPre( {
				content: '[code lang="javascript"]const noop = () => {};[/code]'
			} );

			expect( wrapped ).to.equal( '<pre>[code lang="javascript"]const noop = () =&gt; {};[/code]</pre>' );
		} );

		it( 'should not encode entities when initial non-load', () => {
			const wrapped = wrapPre( {
				content: '[code lang="javascript"]const noop = () =&gt; {};[/code]',
				initial: true
			} );

			expect( wrapped ).to.equal( '<pre>[code lang="javascript"]const noop = () =&gt; {};[/code]</pre>' );
		} );

		it( 'should encode entities when initial load', () => {
			const wrapped = wrapPre( {
				content: '[code lang="javascript"]const noop = () => {};[/code]',
				initial: true,
				load: true
			} );

			expect( wrapped ).to.equal( '<pre>[code lang="javascript"]const noop = () =&gt; {};[/code]</pre>' );
		} );

		it( 'should wrap a sourcecode shortcode', () => {
			const wrapped = wrapPre( {
				content: '[sourcecode lang="javascript"]const noop = () => {};[/sourcecode]'
			} );

			expect( wrapped ).to.equal( '<pre>[sourcecode lang="javascript"]const noop = () =&gt; {};[/sourcecode]</pre>' );
		} );
	} );

	describe( '#unwrapPre()', () => {
		it( 'should unwrap a code shortcode', () => {
			const unwrapped = unwrapPre( {
				content: '<pre>[code lang="javascript"]const noop = () =&gt; {};[/code]</pre>'
			} );

			expect( unwrapped ).to.equal( '<p>[code lang="javascript"]const noop = () => {};[/code]</p>' );
		} );

		it( 'should unwrap a sourcecode shortcode', () => {
			const unwrapped = unwrapPre( {
				content: '<pre>[sourcecode lang="javascript"]const noop = () =&gt; {};[/sourcecode]</pre>'
			} );

			expect( unwrapped ).to.equal( '<p>[sourcecode lang="javascript"]const noop = () => {};[/sourcecode]</p>' );
		} );

		it( 'should gracefully handle surrounding content', () => {
			const unwrapped = unwrapPre( {
				content: '<p>foo</p><p><pre>[sourcecode lang="javascript"]const noop = () =&gt; {};[/sourcecode]</pre></p><p>bar</p>'
			} );

			expect( unwrapped ).to.equal( '<p>foo</p><p>[sourcecode lang="javascript"]const noop = () => {};[/sourcecode]</p><p>bar</p>' );
		} );
	} );
} );
