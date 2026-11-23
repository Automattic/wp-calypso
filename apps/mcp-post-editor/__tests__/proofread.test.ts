/**
 * @vitest-environment jsdom
 */
import { describe, expect, it, vi } from 'vitest';
import {
	boundBlock,
	findQuote,
	isSummaryOnly,
	locate,
	replaceText,
	reviewCount,
	richTextOf,
	undoValue,
	type Bindings,
	type FeedbackItem,
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

describe( 'undoValue', () => {
	// Applies the fix to `before` as Apply does, for Undo.
	const applied = ( before: string, quote: string, replacement: string ) => ( {
		before,
		next: replaceText( before, quote, replacement ) as string,
	} );

	it( 'puts back the value Apply replaced when the text is as Apply left it', () => {
		const undo = applied( 'We met in order to plan.', 'in order to', 'to' );
		expect( undo.next ).toBe( 'We met to plan.' );
		expect( undoValue( 'We met to plan.', undo ) ).toBe( 'We met in order to plan.' );
	} );

	it( 'refuses when the sentence was rewritten, even with the replacement still in it', () => {
		const undo = applied( 'We met in order to plan.', 'in order to', 'to' );
		expect( undoValue( 'We met today.', undo ) ).toBeNull();
	} );

	it( 'changes nothing when the editor’s own undo already put the text back', () => {
		const undo = applied( 'We met in order to plan.', 'in order to', 'to' );
		expect( undoValue( 'We met in order to plan.', undo ) ).toBeUndefined();
	} );

	it( 'undoes the first of two applies in one block, and keeps the second', () => {
		const html = 'A tpyo here, and then much further along this sentence, teh word.';
		const first = applied( html, 'tpyo', 'typo' );
		const second = applied( first.next, 'teh', 'the' );
		expect( undoValue( second.next, first ) ).toBe(
			'A tpyo here, and then much further along this sentence, the word.'
		);
		// The second's text still around it: it undoes too.
		expect(
			undoValue( 'A tpyo here, and then much further along this sentence, the word.', second )
		).toBe( html );
	} );

	it( 'refuses when another change sits right next to the applied one', () => {
		const first = applied( 'A tpyo here.', 'tpyo', 'typo' );
		const second = applied( first.next, 'here', 'there' );
		expect( undoValue( second.next, first ) ).toBeNull();
	} );

	it( 'puts a removed quote back where it was', () => {
		const html = 'It is very good, and the rest of this sentence goes on for a while.';
		const undo = applied( html, 'very', '' );
		expect( undo.next ).toBe( 'It is  good, and the rest of this sentence goes on for a while.' );
		expect( undoValue( undo.next + ' Then more.', undo ) ).toBe( html + ' Then more.' );
		expect( undoValue( 'It is good.', undo ) ).toBeNull();
	} );

	it( 'refuses when the text around the change occurs more than once', () => {
		const undo = applied( 'Teh', 'Teh', 'The' );
		expect( undoValue( 'The cat. The dog.', undo ) ).toBeNull();
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
		expect( locate( bindings, [ first, second ], item, 'proofread' )?.clientId ).toBe( 'b' );
		expect( locate( bindings, [ block( 'new', '' ), first, second ], item, 'proofread' ) ).toEqual(
			{
				clientId: 'b',
				key: 'content',
				next: 'A typo',
			}
		);
	} );

	it( 'doesn’t move to another block with the same words once its own is fixed or gone', () => {
		const bindings: Bindings = new Map();
		const item = issue( 2 );
		const other = block( 'a', 'Intro tpyo' );
		expect(
			locate( bindings, [ other, block( 'b', 'A tpyo' ) ], item, 'proofread' )?.clientId
		).toBe( 'b' );
		expect(
			locate( bindings, [ other, block( 'b', 'A typo' ) ], item, 'proofread' )
		).toBeUndefined();
		expect( locate( bindings, [ other ], item, 'proofread' ) ).toBeUndefined();
	} );

	it( 'searches its block’s inner blocks', () => {
		const blocks = [ block( 'a', 'Intro tpyo' ), block( 'q', '', [ block( 'i', 'A tpyo' ) ] ) ];
		expect( locate( new Map(), blocks, issue( 2 ), 'proofread' )?.clientId ).toBe( 'i' );
	} );

	it( 'binds a new list again only where the bound block is gone', () => {
		const bindings: Bindings = new Map();
		const first = block( 'a', 'Intro tpyo' );
		expect(
			locate( bindings, [ first, block( 'b', 'A tpyo' ) ], issue( 2 ), 'proofread' )?.clientId
		).toBe( 'b' );
		// The same issue in a new list, its index from before the user's new block.
		const blocks = [ block( 'new', 'New tpyo' ), first, block( 'b', 'A tpyo' ) ];
		expect( locate( bindings, blocks, issue( 2 ), 'proofread' )?.clientId ).toBe( 'b' );
		// A merge replaced the block.
		expect(
			locate( bindings, [ first, block( 'c', 'C tpyo' ) ], issue( 2 ), 'proofread' )?.clientId
		).toBe( 'c' );
	} );

	it( 'finds the same issue in its block again when an undo brings the block back', () => {
		const bindings: Bindings = new Map();
		const item = issue( 2 );
		const blocks = [ block( 'a', 'Intro' ), block( 'b', 'A tpyo' ), block( 'c', 'C tpyo' ) ];
		expect( locate( bindings, blocks, item, 'proofread' )?.clientId ).toBe( 'b' );
		// Block b deleted: c, now at its index, has the same quote but isn't its block.
		expect( locate( bindings, [ blocks[ 0 ], blocks[ 2 ] ], item, 'proofread' ) ).toBeUndefined();
		expect( locate( bindings, blocks, item, 'proofread' )?.clientId ).toBe( 'b' );
	} );
} );

describe( 'feedback items', () => {
	const block = ( clientId: string, content: string ) =>
		( {
			clientId,
			name: 'core/paragraph',
			isValid: true,
			attributes: { content },
			innerBlocks: [],
		} ) as never;
	const item = ( fields: Partial< FeedbackItem > ): FeedbackItem => ( {
		id: 'f1',
		block_index: 2,
		title: 'Tighten',
		feedback: 'Wordy',
		quote: 'in order to',
		replacement: 'to',
		requires_manual: false,
		...fields,
	} );
	const blocks = [ block( 'a', 'Intro' ), block( 'b', 'We met in order to plan.' ) ];

	it( 'locates an item’s quote in its block, like a proofreading issue', () => {
		expect( locate( new Map(), blocks, item( {} ), 'feedback' ) ).toEqual( {
			clientId: 'b',
			key: 'content',
			next: 'We met to plan.',
		} );
	} );

	it( 'binds a manual item to its block, with nothing to apply', () => {
		const manual = item( { quote: undefined, replacement: undefined, requires_manual: true } );
		const bindings: Bindings = new Map();
		expect( locate( bindings, blocks, manual, 'feedback' ) ).toBeUndefined();
		expect( boundBlock( bindings, blocks, manual, 'feedback' ) ).toBe( blocks[ 1 ] );
	} );

	it( 'binds the same item again when its block gets a new clientId', () => {
		const bindings: Bindings = new Map();
		const fix = item( {} );
		expect( boundBlock( bindings, blocks, fix, 'feedback' ) ).toBe( blocks[ 1 ] );
		// A rewrite of the block, same content.
		const rewritten = [ blocks[ 0 ], block( 'c', 'We met in order to plan.' ) ];
		expect( locate( bindings, rewritten, fix, 'feedback' )?.clientId ).toBe( 'c' );
		// A transform to a heading.
		const heading = Object.assign( block( 'h', 'We met in order to plan.' ), {
			name: 'core/heading',
		} );
		expect( locate( bindings, [ blocks[ 0 ], heading ], fix, 'feedback' ) ).toEqual( {
			clientId: 'h',
			key: 'content',
			next: 'We met to plan.',
		} );
	} );

	it( 'binds the same manual item again when its block gets a new clientId', () => {
		const manual = item( { quote: undefined, replacement: undefined, requires_manual: true } );
		const bindings: Bindings = new Map();
		expect( boundBlock( bindings, blocks, manual, 'feedback' ) ).toBe( blocks[ 1 ] );
		const replaced = [ blocks[ 0 ], block( 'c', 'We met in order to plan.' ) ];
		expect( boundBlock( bindings, replaced, manual, 'feedback' ) ).toBe( replaced[ 1 ] );
	} );

	it( 'binds the same item back to its block when an undo brings the block back', () => {
		const bindings: Bindings = new Map();
		const fix = item( {} );
		const all = [ ...blocks, block( 'c', 'Outro' ) ];
		expect( boundBlock( bindings, all, fix, 'feedback' ) ).toBe( all[ 1 ] );
		// Block b deleted: the item shows on c, at its index, until b comes back.
		expect( boundBlock( bindings, [ all[ 0 ], all[ 2 ] ], fix, 'feedback' ) ).toBe( all[ 2 ] );
		expect( locate( bindings, all, fix, 'feedback' )?.clientId ).toBe( 'b' );
	} );

	it( 'binds the same item back to its block when an undo brings the last block back', () => {
		const bindings: Bindings = new Map();
		const fix = item( {} );
		expect( boundBlock( bindings, blocks, fix, 'feedback' ) ).toBe( blocks[ 1 ] );
		expect( boundBlock( bindings, [ blocks[ 0 ] ], fix, 'feedback' ) ).toBeUndefined();
		expect( boundBlock( bindings, blocks, fix, 'feedback' ) ).toBe( blocks[ 1 ] );
	} );

	it( 'finds an item whose block didn’t exist yet once the post has one at its index', () => {
		const bindings: Bindings = new Map();
		const fix = item( {} );
		expect( boundBlock( bindings, [ blocks[ 0 ] ], fix, 'feedback' ) ).toBeUndefined();
		expect( boundBlock( bindings, blocks, fix, 'feedback' ) ).toBe( blocks[ 1 ] );
	} );

	it( 'binds a post-wide item to no block', () => {
		const postWide = item( { block_index: null } );
		const bindings: Bindings = new Map();
		expect( boundBlock( bindings, blocks, postWide, 'feedback' ) ).toBeUndefined();
		expect( locate( bindings, blocks, postWide, 'feedback' ) ).toBeUndefined();
		expect( boundBlock( bindings, blocks, postWide, 'feedback' ) ).toBeUndefined();
	} );

	it( 'counts the issues and the feedback items not yet applied or dismissed', () => {
		const items = [ item( { id: 'f1' } ), item( { id: 'f2' } ), item( { id: 'f3' } ) ];
		const status = {
			// A proofreading issue and a feedback item can share an id.
			proofread: { p1: 'applied', f2: 'dismissed' },
			feedback: { f1: 'applied', f3: 'dismissed' },
		} as const;
		expect( reviewCount( status, [ { id: 'p1' }, { id: 'p2' } ], items ) ).toBe( 2 );
	} );
} );

describe( 'isSummaryOnly', () => {
	it( 'is a review with no items but a summary', () => {
		expect( isSummaryOnly( { summary: 'Reads well.', items: [] } ) ).toBe( true );
		expect( isSummaryOnly( { summary: ' ', items: [] } ) ).toBe( false );
		expect( isSummaryOnly( { summary: 'Good', items: [ { id: 'f1' } as FeedbackItem ] } ) ).toBe(
			false
		);
		expect( isSummaryOnly( null ) ).toBe( false );
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
