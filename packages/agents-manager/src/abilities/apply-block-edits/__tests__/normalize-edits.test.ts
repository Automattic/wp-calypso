jest.mock( '@wordpress/blocks', () => ( {
	getBlockTypes: jest.fn( () =>
		[ 'core/paragraph', 'core/group', 'core/button' ].map( ( name ) => ( { name } ) )
	),
} ) );

import { hasRequestedBlockEdits, normalizeEdits } from '../normalize-edits';

const paragraph = { clientId: 'para', name: 'core/paragraph', attributes: { content: 'Hi' } };

describe( 'normalizeEdits', () => {
	it.each( [
		[ 'a string where updates should be', { updates: 'para' }, 'Updates must be an array' ],
		[ 'a number where inserts should be', { inserts: 1 }, 'Insertions must be an array' ],
		[
			'a string where deletes should be',
			{ deletes: 'para' },
			'Deletions must be an array of clientIds',
		],
		[
			'nothing at all',
			{ summary: '' },
			'Response must contain updates, insertions, deletions, custom CSS, or a summary message',
		],
		[
			'an update without a clientId',
			{ updates: [ { name: 'core/paragraph' } ] },
			'Updates must contain clientId and name',
		],
		[
			'an insert without block data',
			{ inserts: [ { block: {} } ] },
			'Insertions must contain block data with a name',
		],
		[
			'a new block of an unregistered type',
			{ inserts: [ { block: { name: 'acme/unknown' } } ] },
			'Block type "acme/unknown" is not available',
		],
		[
			'a nameless new block among the inner blocks',
			{ updates: [ { ...paragraph, innerBlocks: [ {} ] } ] },
			'Block must have a name property',
		],
		[
			'inner blocks that are not a list',
			{ updates: [ { ...paragraph, innerBlocks: {} } ] },
			'Inner blocks must be an array',
		],
		[
			'a nested block whose clientId is not a string',
			{ updates: [ { ...paragraph, innerBlocks: [ { clientId: 7 } ] } ] },
			'Block clientId must be a non-empty string',
		],
		[
			'a nested block whose clientId is empty',
			{ updates: [ { ...paragraph, innerBlocks: [ { clientId: '', name: 'core/paragraph' } ] } ] },
			'Block clientId must be a non-empty string',
		],
		[
			'a summary that is not a string, with nothing else',
			{ summary: 5 },
			'Response must contain updates, insertions, deletions, custom CSS, or a summary message',
		],
		[
			'an insert whose parentClientId is not a string',
			{ inserts: [ { parentClientId: 123, block: { name: 'core/group' } } ] },
			'Insertion parentClientId must be a string',
		],
		[
			'a nested block whose name is not a non-empty string',
			{ updates: [ { ...paragraph, innerBlocks: [ { clientId: 'child', name: 7 } ] } ] },
			'Block name must be a non-empty string',
		],
		[
			'attributes that are not an object',
			{ updates: [ { ...paragraph, attributes: 'red' } ] },
			'Block attributes must be an object',
		],
		[
			'an insert whose index is not a non-negative integer',
			{ inserts: [ { index: '3', block: { name: 'core/group' } } ] },
			'Insertion index must be a non-negative integer',
		],
		[
			'a delete that is neither a string nor `{ clientId }`',
			{ deletes: [ 5 ] },
			'Each deletion must be a clientId string',
		],
	] )( 'rejects %s', ( _, raw, message ) => {
		expect( () => normalizeEdits( raw ) ).toThrow( message );
	} );

	it.each( [
		[ 'a summary alone', { summary: 'Nothing to do.' }, {} ],
		[ 'custom CSS alone', { customCSS: 'p { color: red; }' }, { customCSS: 'p { color: red; }' } ],
		[ 'non-string CSS, dropped', { updates: [], customCSS: 3 }, {} ],
	] )( 'accepts %s', ( _, raw, expected ) => {
		expect( normalizeEdits( raw ) ).toStrictEqual( {
			updates: [],
			inserts: [],
			deletes: [],
			...expected,
		} );
	} );

	it( 'takes a lone object as a one-entry list and drops nullish entries', () => {
		const edits = normalizeEdits( {
			updates: paragraph,
			inserts: { block: { name: 'core/group' } },
			deletes: [ null, 'gone', undefined ],
		} );

		expect( edits ).toEqual( {
			updates: [ paragraph ],
			inserts: [ { block: { name: 'core/group' } } ],
			deletes: [ 'gone' ],
		} );
	} );

	it( 'unwraps a delete sent as `{ clientId }`', () => {
		expect( normalizeEdits( { deletes: [ { clientId: 'gone' }, 'also' ] } ).deletes ).toEqual( [
			'gone',
			'also',
		] );
	} );

	// A reorder lists existing children by id alone, and an existing block may be
	// of a type the editor registered under another name.
	it( 'lets a block with a clientId carry an unknown name or none', () => {
		const update = {
			clientId: 'group',
			name: 'acme/legacy',
			innerBlocks: [ { clientId: 'child-b' }, { clientId: 'child-a' } ],
		};

		expect( normalizeEdits( { updates: [ update ] } ).updates ).toEqual( [ update ] );
	} );

	// The backend serializes an empty attributes object as `[]`.
	it( 'drops `[]` attributes on updates, inserts and their children', () => {
		const edits = normalizeEdits( {
			updates: [
				{
					clientId: 'group',
					name: 'core/group',
					attributes: [],
					innerBlocks: [ { clientId: 'child-b', attributes: [] }, { clientId: 'child-a' } ],
				},
			],
			inserts: [ { block: { name: 'core/group', attributes: [] } } ],
		} );

		expect( edits.updates ).toEqual( [
			{
				clientId: 'group',
				name: 'core/group',
				innerBlocks: [ { clientId: 'child-b' }, { clientId: 'child-a' } ],
			},
		] );
		expect( edits.inserts ).toEqual( [ { block: { name: 'core/group' } } ] );
	} );

	it( 'keeps only the typed fields of an insert, so `parentClientId: null` means the top level', () => {
		const edits = normalizeEdits( {
			inserts: [ { parentClientId: null, index: 2, block: { name: 'core/group' }, extra: true } ],
		} );

		expect( edits.inserts ).toEqual( [ { index: 2, block: { name: 'core/group' } } ] );
	} );

	it( 'returns new lists and leaves the input as it was', () => {
		const raw = { updates: [ null, paragraph ], deletes: [ { clientId: 'gone' } ] };
		const snapshot = JSON.parse( JSON.stringify( raw ) );

		const edits = normalizeEdits( raw );

		expect( raw ).toEqual( snapshot );
		expect( edits.updates ).not.toBe( raw.updates );
		expect( edits.deletes ).not.toBe( raw.deletes );
	} );
} );

describe( 'hasRequestedBlockEdits', () => {
	it.each( [
		[ 'an update', { updates: [ paragraph ] }, true ],
		[ 'an insert', { inserts: [ { block: { name: 'core/group' } } ] }, true ],
		[ 'a delete', { deletes: [ 'gone' ] }, true ],
		[ 'custom CSS alone', { customCSS: 'p {}' }, false ],
	] )( 'is %s for %s', ( _, raw, expected ) => {
		expect( hasRequestedBlockEdits( normalizeEdits( raw ) ) ).toBe( expected );
	} );
} );
