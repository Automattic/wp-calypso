/** @format */
/**
 * External dependencies
 */
import { wrapPre, unwrapPre } from '../plugin';

jest.mock( 'tinymce/tinymce', () => ( {} ) );

describe( 'wpcom-sourcecode', () => {
	describe( '#wrapPre()', () => {
		test( 'should wrap a code shortcode', () => {
			const wrapped = wrapPre( {
				content: '[code lang="javascript"]const noop = () => {};[/code]',
			} );

			expect( wrapped ).toBe(
				'<pre>[code lang="javascript"]const noop = () =&gt; {};[/code]</pre>'
			);
		} );

		test( 'should not encode entities when initial non-load', () => {
			const wrapped = wrapPre( {
				content: '[code lang="javascript"]const noop = () =&gt; {};[/code]',
				initial: true,
			} );

			expect( wrapped ).toBe(
				'<pre>[code lang="javascript"]const noop = () =&gt; {};[/code]</pre>'
			);
		} );

		test( 'should encode entities when initial load', () => {
			const wrapped = wrapPre( {
				content: '[code lang="javascript"]const noop = () => {};[/code]',
				initial: true,
				load: true,
			} );

			expect( wrapped ).toBe(
				'<pre>[code lang="javascript"]const noop = () =&gt; {};[/code]</pre>'
			);
		} );

		test( 'should wrap a sourcecode shortcode', () => {
			const wrapped = wrapPre( {
				content: '[sourcecode lang="javascript"]const noop = () => {};[/sourcecode]',
			} );

			expect( wrapped ).toBe(
				'<pre>[sourcecode lang="javascript"]const noop = () =&gt; {};[/sourcecode]</pre>'
			);
		} );
	} );

	describe( '#unwrapPre()', () => {
		test( 'should unwrap a code shortcode', () => {
			const unwrapped = unwrapPre( {
				content: '<pre>[code lang="javascript"]const noop = () =&gt; {};[/code]</pre>',
			} );

			expect( unwrapped ).toBe( '<p>[code lang="javascript"]const noop = () => {};[/code]</p>' );
		} );

		test( 'should unwrap a sourcecode shortcode', () => {
			const unwrapped = unwrapPre( {
				content: '<pre>[sourcecode lang="javascript"]const noop = () =&gt; {};[/sourcecode]</pre>',
			} );

			expect( unwrapped ).toBe(
				'<p>[sourcecode lang="javascript"]const noop = () => {};[/sourcecode]</p>'
			);
		} );

		test( 'should gracefully handle surrounding content', () => {
			const unwrapped = unwrapPre( {
				content:
					'<p>foo</p><p><pre>[sourcecode lang="javascript"]const noop = () =&gt; {};[/sourcecode]</pre></p><p>bar</p>',
			} );

			expect( unwrapped ).toBe(
				'<p>foo</p><p>[sourcecode lang="javascript"]const noop = () => {};[/sourcecode]</p><p>bar</p>'
			);
		} );
	} );
} );
