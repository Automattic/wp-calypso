/**
 * @vitest-environment jsdom
 */
import { describe, expect, it, vi } from 'vitest';
import {
	findQuote,
	locate,
	replaceText,
	richTextOf,
	type Bindings,
	type ProofreadIssue,
} from '../editor/proofread';

describe( 'findQuote', () => {
	it( 'finds a quote across formatting, which replaceText leaves alone', () => {
		const element = document.createElement( 'p' );
		element.innerHTML = 'We bake <strong>three dou</strong>ghs.';
		const range = findQuote( element, 'three doughs' );
		expect( range?.toString() ).toBe( 'three doughs' );
		expect( range?.endOffset ).toBe( 3 );
		expect( replaceText( element.innerHTML, 'three doughs', 'X' ) ).toBeNull();
	} );

	it( 'matches the text as the server normalises it', () => {
		const element = document.createElement( 'div' );
		element.innerHTML = 'One&nbsp;two  three<br>four <pre>five</pre>six';
		expect( findQuote( element, 'One two three four' )?.toString() ).toBe(
			'One\u00a0two  three'.concat( 'four' )
		);
		expect( findQuote( element, 'four five six' )?.toString() ).toBe( 'four fivesix' );
	} );

	it( 'skips the text of inner blocks', () => {
		const element = document.createElement( 'div' );
		element.dataset.block = 'outer';
		element.innerHTML = '<div data-block="inner"><p>tpyo</p></div><cite>a tpyo</cite>';
		expect( findQuote( element, 'tpyo' )?.startContainer.textContent ).toBe( 'a tpyo' );
	} );

	it( 'returns null when the block no longer has the quote', () => {
		const element = document.createElement( 'p' );
		element.textContent = 'We bake bread.';
		expect( findQuote( element, 'three doughs' ) ).toBeNull();
		expect( findQuote( element, '' ) ).toBeNull();
	} );
} );

describe( 'replaceText', () => {
	it( 'replaces text, not markup, and escapes the replacement', () => {
		expect( replaceText( '<a href="tpyo">a tpyo</a> &amp; more', 'tpyo', '<b>typo</b>' ) ).toBe(
			'<a href="tpyo">a &lt;b>typo&lt;/b></a> &amp; more'
		);
	} );

	it( 'leaves the entities around the quote as they are', () => {
		expect( replaceText( 'A tpyo &copy; 2026 it&#8217;s &amp; more', 'tpyo', 'typo' ) ).toBe(
			'A typo &copy; 2026 it&#8217;s &amp; more'
		);
	} );

	it( 'matches a quote through its entities', () => {
		expect( replaceText( 'Bread &amp; it&#8217;s &copy; tpyo', '© tpyo', '© typo' ) ).toBe(
			'Bread &amp; it&#8217;s © typo'
		);
		expect( replaceText( 'Bread &amp; it&#8217;s tpyo', 'it’s tpyo', 'it’s typo' ) ).toBe(
			'Bread &amp; it’s typo'
		);
	} );

	it( 'matches through a double space, an NBSP and a <br>, and splices only the quote', () => {
		const html = 'Keep &copy; this. A  tpyo&nbsp;here<br>and there. Keep &amp; that.';
		expect( replaceText( html, 'A tpyo here and there.', 'A typo here.' ) ).toBe(
			'Keep &copy; this. A typo here. Keep &amp; that.'
		);
		expect( replaceText( '<pre>a\n  tpyo</pre>', 'a tpyo', 'a typo' ) ).toBe( '<pre>a typo</pre>' );
	} );

	it( 'returns null when the quote is gone or crosses formatting', () => {
		expect( replaceText( '<p>text</p>', 'gone', 'x' ) ).toBeNull();
		expect( replaceText( 'a <b>tp</b>yo', 'tpyo', 'x' ) ).toBeNull();
	} );
} );

describe( 'locate', () => {
	const block = ( clientId: string, content: string, innerBlocks: unknown[] = [] ) =>
		( {
			clientId,
			name: 'core/paragraph',
			isValid: true,
			attributes: { content },
			innerBlocks,
		} ) as never;
	const issue = ( block_index: number ): ProofreadIssue => ( {
		id: 'p1',
		block_index,
		quote: 'tpyo',
		replacement: 'typo',
		reason: '',
		kind: 'spelling',
	} );

	it( 'follows its block when the user inserts one above it', () => {
		const bindings: Bindings = new Map();
		const item = issue( 2 );
		const first = block( 'a', 'Intro tpyo' );
		const second = block( 'b', 'A tpyo' );
		expect( locate( bindings, [ first, second ], item )?.clientId ).toBe( 'b' );
		expect( locate( bindings, [ block( 'new', '' ), first, second ], item ) ).toEqual( {
			clientId: 'b',
			key: 'content',
			next: 'A typo',
		} );
	} );

	it( 'doesn’t move to another block with the same words once its own is fixed or gone', () => {
		const bindings: Bindings = new Map();
		const item = issue( 2 );
		const other = block( 'a', 'Intro tpyo' );
		expect( locate( bindings, [ other, block( 'b', 'A tpyo' ) ], item )?.clientId ).toBe( 'b' );
		expect( locate( bindings, [ other, block( 'b', 'A typo' ) ], item ) ).toBeUndefined();
		expect( locate( bindings, [ other ], item ) ).toBeUndefined();
	} );

	it( 'searches its block’s inner blocks', () => {
		const blocks = [ block( 'a', 'Intro tpyo' ), block( 'q', '', [ block( 'i', 'A tpyo' ) ] ) ];
		expect( locate( new Map(), blocks, issue( 2 ) )?.clientId ).toBe( 'i' );
	} );

	it( 'binds a new list again only where the bound block is gone', () => {
		const bindings: Bindings = new Map();
		const first = block( 'a', 'Intro tpyo' );
		expect( locate( bindings, [ first, block( 'b', 'A tpyo' ) ], issue( 2 ) )?.clientId ).toBe(
			'b'
		);
		// The same issue in a new list, its index from before the user's new block.
		const blocks = [ block( 'new', 'New tpyo' ), first, block( 'b', 'A tpyo' ) ];
		expect( locate( bindings, blocks, issue( 2 ) )?.clientId ).toBe( 'b' );
		// A merge replaced the block.
		expect( locate( bindings, [ first, block( 'c', 'C tpyo' ) ], issue( 2 ) )?.clientId ).toBe(
			'c'
		);
	} );
} );

describe( 'richTextOf', () => {
	it( 'returns the attribute’s rich text in the block, not an inner block’s', () => {
		// jsdom has no CSS; the client ids here need no escaping.
		vi.stubGlobal( 'CSS', { escape: ( value: string ) => value } );
		document.body.innerHTML = `<div class="editor-styles-wrapper">
			<figure data-block="t"><table><td>tpyo</td></table>
				<div data-block="i"><figcaption data-wp-block-attribute-key="caption">inner</figcaption></div>
				<figcaption data-wp-block-attribute-key="caption">A tpyo</figcaption></figure>
			<p data-block="p" data-wp-block-attribute-key="content">tpyo</p></div>`;
		expect( richTextOf( { clientId: 't', key: 'caption', next: '' } )?.textContent ).toBe(
			'A tpyo'
		);
		expect( richTextOf( { clientId: 't', key: 'content', next: '' } ) ).toBeUndefined();
		expect( richTextOf( { clientId: 'p', key: 'content', next: '' } )?.localName ).toBe( 'p' );
		vi.unstubAllGlobals();
	} );
} );
