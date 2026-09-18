jest.mock( '../../../utils/editor-blocks', () => ( {
	getBlock: jest.fn(),
	getBlocks: jest.fn(),
} ) );

import { getBlock, getBlocks } from '../../../utils/editor-blocks';
import { areUpdateEditsAlreadySatisfied } from '../already-applied';
import type { EditorBlock } from '../../../utils/editor-blocks';
import type { BlockEdits, BlockUpdate } from '../types';

const block = (
	clientId: string,
	name: string,
	attributes: Record< string, unknown > = {},
	innerBlocks: EditorBlock[] = []
): EditorBlock => ( { clientId, name, attributes, innerBlocks } );

const columnA = block( 'column-a', 'core/column', { metadata: { name: 'A' } } );
const columnB = block( 'column-b', 'core/column', { metadata: { name: 'B' } } );
const blocks: Record< string, EditorBlock > = {
	button: block( 'button', 'core/button', { url: 'https://example.com/projects/' } ),
	paragraph: block( 'paragraph', 'core/paragraph', {
		content: 'Hello',
		style: { color: { text: '#111111', background: '#ffffff' } },
	} ),
	// A `core/columns` controls its children: the store lists them by `getBlocks` only.
	columns: block( 'columns', 'core/columns' ),
	'column-a': columnA,
	'column-b': columnB,
};
const shortIds: Record< string, string > = {
	btn: 'button',
	para: 'paragraph',
	cols: 'columns',
	colA: 'column-a',
	colB: 'column-b',
};
const resolve = ( id: string ) => shortIds[ id ] ?? id;

const updateOnly = ( ...updates: BlockUpdate[] ): BlockEdits => ( {
	updates,
	inserts: [],
	deletes: [],
} );

const satisfiedUpdate: BlockUpdate = {
	clientId: 'btn',
	name: 'core/button',
	attributes: { url: 'https://example.com/projects/' },
};

beforeEach( () => {
	jest.resetAllMocks();
	jest.mocked( getBlock ).mockImplementation( ( clientId ) => blocks[ clientId ] );
	jest
		.mocked( getBlocks )
		.mockImplementation( ( clientId ) => ( clientId === 'columns' ? [ columnB, columnA ] : [] ) );
} );

describe( 'areUpdateEditsAlreadySatisfied', () => {
	it.each( [
		[ 'the requested value is already there', satisfiedUpdate ],
		[
			'the requested nested attributes are a subset of the current ones',
			{
				clientId: 'para',
				name: 'core/paragraph',
				attributes: { style: { color: { text: '#111111' } } },
			},
		],
		[
			'a `null` delete signal names an attribute that is already absent',
			{
				clientId: 'para',
				name: 'core/paragraph',
				attributes: { style: { color: { link: null } } },
			},
		],
		[
			'the requested child order is the current one',
			{
				clientId: 'cols',
				name: 'core/columns',
				attributes: {},
				innerBlocks: [
					{ clientId: 'colB', name: 'core/column' },
					{ clientId: 'colA', name: 'core/column' },
				],
			},
		],
	] )( 'is true when %s', ( _, update ) => {
		expect( areUpdateEditsAlreadySatisfied( updateOnly( update ), resolve ) ).toBe( true );
	} );

	it.each( [
		[
			'the requested value differs',
			updateOnly( {
				clientId: 'btn',
				name: 'core/button',
				attributes: { url: 'https://example.com/other/' },
			} ),
		],
		[
			'the target is not on the page',
			updateOnly( { clientId: 'missing', name: 'core/button', attributes: {} } ),
		],
		[
			'the target is a block of another type',
			updateOnly( { clientId: 'btn', name: 'core/paragraph' } ),
		],
		[
			'a `null` delete signal names an attribute that is still set',
			updateOnly( {
				clientId: 'para',
				name: 'core/paragraph',
				attributes: { style: { color: { text: null } } },
			} ),
		],
		[
			'the requested child order differs from the current one',
			updateOnly( {
				clientId: 'cols',
				name: 'core/columns',
				attributes: {},
				innerBlocks: [
					{ clientId: 'colA', name: 'core/column' },
					{ clientId: 'colB', name: 'core/column' },
				],
			} ),
		],
		[
			'a listed child asks for an attribute it does not have',
			updateOnly( {
				clientId: 'cols',
				name: 'core/columns',
				innerBlocks: [
					{ clientId: 'colB', name: 'core/column', attributes: { metadata: { name: 'Other' } } },
					{ clientId: 'colA', name: 'core/column' },
				],
			} ),
		],
		[
			'an insert rides along',
			{ ...updateOnly( satisfiedUpdate ), inserts: [ { block: { name: 'core/paragraph' } } ] },
		],
		[ 'a delete rides along', { ...updateOnly( satisfiedUpdate ), deletes: [ 'para' ] } ],
		[ 'there is no update at all', updateOnly() ],
	] )( 'is false when %s', ( _, edits ) => {
		expect( areUpdateEditsAlreadySatisfied( edits, resolve ) ).toBe( false );
	} );
} );
