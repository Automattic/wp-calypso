jest.mock( '@wordpress/blocks', () => {
	let nextId = 0;

	return {
		createBlock: jest.fn( ( name, attributes = {}, innerBlocks = [] ) => ( {
			clientId: `new-${ ++nextId }`,
			name,
			attributes,
			innerBlocks,
		} ) ),
		getBlockType: jest.fn( ( name: string ) =>
			name.startsWith( 'core/' ) ? { name } : undefined
		),
		parse: jest.fn( () => [] ),
		serialize: jest.fn( ( blocks: unknown[] ) => `<!-- ${ blocks.length } blocks -->` ),
		validateBlock: jest.fn( ( block: { attributes?: { valid?: boolean } } ) => [
			block.attributes?.valid !== false,
			[],
		] ),
	};
} );

import { createBlock, parse } from '@wordpress/blocks';
import {
	extractCompleteTopLevelBlock,
	fixNestedParagraphs,
	parseBlockComment,
	repairBlocksFromMarkup,
	sanitizeBlockTree,
	withSuppressedValidationLogs,
} from '../block-markup';

const block = (
	name: string,
	attributes: Record< string, unknown > = {},
	innerBlocks: unknown[] = []
) => ( {
	clientId: `id-${ name }`,
	name,
	attributes,
	innerBlocks,
} );

beforeEach( () => jest.clearAllMocks() );

describe( 'parseBlockComment', () => {
	it.each( [
		{
			comment: '<!-- wp:group {"layout":{"type":"flex"}} -->',
			expected: {
				blockName: 'core/group',
				attributes: { layout: { type: 'flex' } },
				isSelfClosing: false,
			},
		},
		{
			comment: '<!-- wp:spacer /-->',
			expected: { blockName: 'core/spacer', attributes: {}, isSelfClosing: true },
		},
		{
			comment: '<!-- wp:wpcom/site-section {"a":1} /-->',
			expected: { blockName: 'wpcom/site-section', attributes: { a: 1 }, isSelfClosing: true },
		},
		{
			comment: '<!-- wp:group {not json} -->',
			expected: { blockName: 'core/group', attributes: {}, isSelfClosing: false },
		},
	] )( 'parses $comment', ( { comment, expected } ) => {
		expect( parseBlockComment( comment ) ).toEqual( expected );
	} );

	it.each( [ '<!-- /wp:group -->', '<!-- a plain comment -->' ] )(
		'is null for %s',
		( comment ) => {
			expect( parseBlockComment( comment ) ).toBeNull();
		}
	);
} );

describe( 'fixNestedParagraphs', () => {
	it.each( [
		{
			case: 'merging classes, styles and the keys the outer lacks',
			content:
				'<p class="a b" style="color:red;top:1px" id="x"><p class="b c" style="color:blue" id="y" title="t">Hi</p></p>',
			expected: '<p class="a b c" style="color:blue;top:1px" id="x" title="t">Hi</p>',
		},
		{
			case: 'reading both quote styles, double quotes winning',
			content: "<p class=\"a\" id='b' class='c'><p>Hi</p></p>",
			expected: '<p class="a" id="b">Hi</p>',
		},
		{
			case: 'escaping a quote from a single-quoted value',
			content: '<p title=\'say "hi"\'><p>Hi</p></p>',
			expected: '<p title="say &quot;hi&quot;">Hi</p>',
		},
		{
			case: 'down to the innermost paragraph',
			content: '<p><p><p>Hi</p></p></p>',
			expected: '<p>Hi</p>',
		},
	] )( 'collapses a paragraph nested in a paragraph block, $case', ( { content, expected } ) => {
		const wrap = ( inner: string ) => `<!-- wp:paragraph -->${ inner }<!-- /wp:paragraph -->`;

		expect( fixNestedParagraphs( wrap( content ) ) ).toBe( wrap( expected ) );
	} );

	it( 'leaves nesting outside a paragraph block alone', () => {
		const markup = '<!-- wp:group --><p><p>x</p></p><!-- /wp:group --><!-- wp:paragraph /-->';

		expect( fixNestedParagraphs( markup ) ).toBe( markup );
	} );

	it( 'leaves markup without paragraph blocks alone', () => {
		expect( fixNestedParagraphs( '<p><p>x</p></p>' ) ).toBe( '<p><p>x</p></p>' );
	} );
} );

describe( 'extractCompleteTopLevelBlock', () => {
	const group = '<!-- wp:group --><div><!-- wp:spacer /--></div><!-- /wp:group -->';

	it.each( [
		{
			case: 'a self-closing block',
			buffer: '<!-- wp:spacer /--><!-- wp:x',
			markup: '<!-- wp:spacer /-->',
			remaining: '<!-- wp:x',
		},
		{
			case: 'a container with children',
			buffer: `${ group }tail`,
			markup: group,
			remaining: 'tail',
		},
		{
			case: 'a raw-content block holding delimiter-like text',
			buffer: '<!-- wp:html --><!-- wp:group --><!-- /wp:html -->',
			markup: '<!-- wp:html --><!-- wp:group --><!-- /wp:html -->',
			remaining: '',
		},
		{
			case: 'attribute JSON holding an arrow',
			buffer: '<!-- wp:group {"note":"-->"} --><!-- /wp:group -->',
			markup: '<!-- wp:group {"note":"-->"} --><!-- /wp:group -->',
			remaining: '',
		},
		{
			case: 'wrapper HTML ahead of the first delimiter',
			buffer: `<div>${ group }`,
			markup: group,
			remaining: '',
		},
		{
			case: 'a container nested two deep',
			buffer: `<!-- wp:group --><!-- wp:columns --><!-- wp:column -->${ group }<!-- /wp:column --><!-- /wp:columns --><!-- /wp:group -->x`,
			markup: `<!-- wp:group --><!-- wp:columns --><!-- wp:column -->${ group }<!-- /wp:column --><!-- /wp:columns --><!-- /wp:group -->`,
			remaining: 'x',
		},
	] )( 'takes $case', ( { buffer, markup, remaining } ) => {
		expect( extractCompleteTopLevelBlock( buffer ) ).toEqual( { blockMarkup: markup, remaining } );
	} );

	it.each( [
		'<!-- wp:group --><div><!-- wp:spacer /-->',
		'<!-- wp:group {"a":',
		'<!-- wp:html --><!-- wp:group -->',
		'<!-- wp:group --><div></div><!-- /wp:gro',
		'<div>no block',
		'   ',
	] )( 'waits on %s', ( buffer ) => {
		expect( extractCompleteTopLevelBlock( buffer ) ).toBeNull();
	} );
} );

describe( 'sanitizeBlockTree', () => {
	it( 'drops blocks without a clientId or name, at any depth', () => {
		const tree = [
			block( 'core/group', {}, [ { name: 'core/spacer' }, block( 'core/spacer' ) ] ),
			{ clientId: 'x' },
			null,
		] as never;

		expect( sanitizeBlockTree( tree ) ).toEqual( [
			block( 'core/group', {}, [ block( 'core/spacer' ) ] ),
		] );
	} );
} );

describe( 'withSuppressedValidationLogs', () => {
	it( 'silences validation output only, and restores the console', () => {
		const warn = jest.spyOn( console, 'warn' ).mockImplementation( () => {} );

		/* eslint-disable no-console */
		withSuppressedValidationLogs( () => {
			console.warn( 'Block validation: mismatch' );
			console.warn( 'other' );
		} );
		console.warn( 'Block validation: after' );
		/* eslint-enable no-console */

		expect( warn.mock.calls.map( ( [ message ] ) => message ) ).toEqual( [
			'other',
			'Block validation: after',
		] );
		warn.mockRestore();
	} );
} );

describe( 'repairBlocksFromMarkup', () => {
	it( 'rebuilds a block the editor would refuse, and parses the normalized markup', () => {
		const invalid = block( 'core/paragraph', { valid: false, content: 'Hi' } );
		( parse as jest.Mock )
			.mockReturnValueOnce( [ invalid ] )
			.mockReturnValueOnce( [ block( 'core/paragraph' ) ] );

		const repaired = repairBlocksFromMarkup( '<!-- wp:paragraph -->x<!-- /wp:paragraph -->' );

		expect( createBlock ).toHaveBeenCalledWith( 'core/paragraph', invalid.attributes, undefined );
		expect( parse ).toHaveBeenLastCalledWith( '<!-- 1 blocks -->' );
		expect( repaired ).toEqual( [ block( 'core/paragraph' ) ] );
	} );

	it( 'rebuilds the parent of a repaired child, from the repaired children', () => {
		const invalid = block( 'core/paragraph', { valid: false } );
		const group = block( 'core/group', {}, [ invalid ] );
		( parse as jest.Mock ).mockReturnValueOnce( [ group ] ).mockReturnValueOnce( [ group ] );

		repairBlocksFromMarkup( '<!-- wp:group -->x<!-- /wp:group -->' );

		const { results } = ( createBlock as jest.Mock ).mock;
		expect( results ).toHaveLength( 2 );
		expect( createBlock ).toHaveBeenLastCalledWith( 'core/group', {}, [ results[ 0 ].value ] );
	} );

	it( 'keeps a valid block as it is', () => {
		const valid = block( 'core/paragraph' );
		( parse as jest.Mock ).mockReturnValueOnce( [ valid ] ).mockReturnValueOnce( [ valid ] );

		expect( repairBlocksFromMarkup( '<!-- wp:paragraph /-->' ) ).toEqual( [ valid ] );
		expect( createBlock ).not.toHaveBeenCalled();
	} );

	it( 'is empty when the markup parses to nothing', () => {
		expect( repairBlocksFromMarkup( '' ) ).toEqual( [] );
		expect( parse ).toHaveBeenCalledTimes( 1 );
	} );
} );
