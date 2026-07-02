/**
 * Unit tests for the pure block-edit engine ported from Big Sky's
 * `big-sky/apply-block-edits` ability. These functions are dependency-injected
 * (createBlock / available block types are passed in) so they carry no
 * `@wordpress/*` or `window.wp` coupling and can be tested in isolation.
 */
import {
	createBlockRecursively,
	mergeBlockAttributes,
	mergeBlocksRecursively,
	normalizeBlockEdits,
	resolveClientId,
	validateBlockData,
	validateBlockEdits,
} from './block-edits';

describe( 'resolveClientId', () => {
	it( 'returns undefined for an empty or missing clientId', () => {
		expect( resolveClientId( undefined, {} ) ).toBeUndefined();
		expect( resolveClientId( null, {} ) ).toBeUndefined();
		expect( resolveClientId( '', {} ) ).toBeUndefined();
	} );

	it( 'maps a compressed clientId through the reverse map', () => {
		expect( resolveClientId( 'b1', { b1: 'real-1' } ) ).toBe( 'real-1' );
	} );

	it( 'falls back to the raw clientId when it is not in the map (real clientIds)', () => {
		expect( resolveClientId( 'real-1', {} ) ).toBe( 'real-1' );
	} );
} );

describe( 'normalizeBlockEdits', () => {
	it( 'drops falsy update and insert entries', () => {
		const edits = normalizeBlockEdits( {
			updates: [ null as any, { clientId: 'a', name: 'core/paragraph' } ],
			inserts: [ undefined as any, { block: { name: 'core/heading' } } ],
			summary: 'x',
		} );
		expect( edits.updates ).toHaveLength( 1 );
		expect( edits.inserts ).toHaveLength( 1 );
	} );

	it( 'coerces object-shaped deletes to clientId strings and drops the rest', () => {
		const edits = normalizeBlockEdits( {
			deletes: [ 'a', { clientId: 'b' }, {} as any, null as any ],
			summary: 'x',
		} );
		expect( edits.deletes ).toEqual( [ 'a', 'b' ] );
	} );

	it( 'throws when there is nothing to do', () => {
		expect( () => normalizeBlockEdits( {} ) ).toThrow();
	} );

	it( 'does not throw when only a summary is present', () => {
		expect( () => normalizeBlockEdits( { summary: 'done' } ) ).not.toThrow();
	} );

	it( 'passes a string customCSS through', () => {
		expect( normalizeBlockEdits( { customCSS: 'body{}' } ).customCSS ).toBe( 'body{}' );
	} );
} );

describe( 'mergeBlockAttributes', () => {
	it( 'deep-merges nested objects', () => {
		expect(
			mergeBlockAttributes( { style: { color: 'red', size: 1 } }, { style: { color: 'blue' } } )
		).toEqual( { style: { color: 'blue', size: 1 } } );
	} );

	it( 'unsets a key when the source value is null', () => {
		expect( mergeBlockAttributes( { a: 1, b: 2 }, { b: null } ) ).toEqual( { a: 1, b: undefined } );
	} );

	it( 'replaces (does not merge) arrays', () => {
		expect( mergeBlockAttributes( { list: [ 1, 2, 3 ] }, { list: [ 9 ] } ) ).toEqual( {
			list: [ 9 ],
		} );
	} );
} );

describe( 'mergeBlocksRecursively', () => {
	it( 'returns the new block data when there is no original block', () => {
		const data = { name: 'core/paragraph', attributes: { content: 'hi' } };
		expect( mergeBlocksRecursively( null, data, {} ) ).toBe( data );
	} );

	it( 'preserves original attributes when the new attributes are an empty object', () => {
		const original = {
			clientId: 'a',
			name: 'core/paragraph',
			attributes: { content: 'keep me' },
		};
		const merged = mergeBlocksRecursively( original, { clientId: 'a', attributes: {} }, {} );
		expect( merged.attributes ).toEqual( { content: 'keep me' } );
	} );

	it( 'deep-merges attributes when new attributes are provided', () => {
		const original = {
			clientId: 'a',
			name: 'core/paragraph',
			attributes: { content: 'old', level: 2 },
		};
		const merged = mergeBlocksRecursively(
			original,
			{ clientId: 'a', attributes: { content: 'new' } },
			{}
		);
		expect( merged.attributes ).toEqual( { content: 'new', level: 2 } );
	} );

	it( 'throws when a bare { clientId } inner reference cannot be resolved', () => {
		const original = {
			clientId: 'a',
			name: 'core/group',
			attributes: {},
			innerBlocks: [],
		};
		expect( () =>
			mergeBlocksRecursively(
				original,
				{ clientId: 'a', innerBlocks: [ { clientId: 'missing' } ] },
				{}
			)
		).toThrow();
	} );
} );

describe( 'validateBlockData', () => {
	const available = new Set( [ 'core/paragraph', 'core/heading' ] );

	it( 'accepts a bare clientId reference when allowClientIdOnly is set', () => {
		expect( () =>
			validateBlockData( { clientId: 'a' }, available, { allowClientIdOnly: true } )
		).not.toThrow();
	} );

	it( 'throws when a block has no name', () => {
		expect( () => validateBlockData( {}, available ) ).toThrow();
	} );

	it( 'throws when the block type is not registered', () => {
		expect( () => validateBlockData( { name: 'core/nonexistent' }, available ) ).toThrow();
	} );

	it( 'recurses into inner blocks', () => {
		expect( () =>
			validateBlockData(
				{ name: 'core/paragraph', innerBlocks: [ { name: 'core/nonexistent' } ] },
				available
			)
		).toThrow();
	} );
} );

describe( 'validateBlockEdits', () => {
	const available = new Set( [ 'core/paragraph' ] );

	it( 'throws when an update is missing a clientId', () => {
		expect( () =>
			validateBlockEdits(
				{ updates: [ { name: 'core/paragraph' } as any ], inserts: [], deletes: [] },
				available
			)
		).toThrow();
	} );

	it( 'throws when an insert has no block name', () => {
		expect( () =>
			validateBlockEdits(
				{ updates: [], inserts: [ { block: {} } as any ], deletes: [] },
				available
			)
		).toThrow();
	} );

	it( 'accepts valid edits', () => {
		expect( () =>
			validateBlockEdits(
				{
					updates: [ { clientId: 'a', name: 'core/paragraph' } ],
					inserts: [ { block: { name: 'core/paragraph' } } ],
					deletes: [ 'b' ],
				},
				available
			)
		).not.toThrow();
	} );
} );

describe( 'createBlockRecursively', () => {
	// Fake createBlock mirroring @wordpress/blocks' signature.
	const fakeCreateBlock = ( name: string, attributes: any, innerBlocks: any[] ) => ( {
		clientId: `client-${ name }`,
		name,
		attributes,
		innerBlocks,
	} );

	it( 'throws when the block data has no name', async () => {
		await expect( createBlockRecursively( {}, fakeCreateBlock as any ) ).rejects.toThrow();
	} );

	it( 'creates a block with its attributes', async () => {
		const block = await createBlockRecursively(
			{ name: 'core/paragraph', attributes: { content: 'hi' } },
			fakeCreateBlock as any
		);
		expect( block.name ).toBe( 'core/paragraph' );
		expect( block.attributes ).toEqual( { content: 'hi' } );
	} );

	it( 'builds inner blocks recursively', async () => {
		const block = await createBlockRecursively(
			{
				name: 'core/group',
				innerBlocks: [ { name: 'core/paragraph', attributes: { content: 'child' } } ],
			},
			fakeCreateBlock as any
		);
		expect( block.innerBlocks ).toHaveLength( 1 );
		expect( block.innerBlocks![ 0 ].name ).toBe( 'core/paragraph' );
	} );
} );
