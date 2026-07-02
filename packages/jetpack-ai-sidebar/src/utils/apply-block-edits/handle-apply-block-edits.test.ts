/**
 * Behavioural tests for the `handleApplyBlockEdits` client handler. A minimal
 * in-memory block editor stands in for `window.wp.data` / `window.wp.blocks` so
 * the insert / update / delete flow, the "no changes" honest-failure guard, and
 * the custom-CSS refusal can be exercised without a real Gutenberg editor.
 */
import { handleApplyBlockEdits } from './handle-apply-block-edits';

interface FakeBlock {
	clientId: string;
	name: string;
	attributes: Record< string, unknown >;
	innerBlocks: FakeBlock[];
}

function makeBlock(
	partial: Partial< FakeBlock > & { clientId: string; name: string }
): FakeBlock {
	return { attributes: {}, innerBlocks: [], ...partial };
}

/**
 * Install a fake `window.wp` backed by a mutable block tree and return helpers
 * to inspect it. Registered block types default to a small allow-list.
 */
function installFakeEditor(
	initial: FakeBlock[],
	blockTypes = [ 'core/paragraph', 'core/heading', 'core/group' ]
) {
	const blocks = initial;
	let counter = 0;

	function findWithParent(
		clientId: string,
		list: FakeBlock[] = blocks
	): { list: FakeBlock[]; index: number } | null {
		for ( let i = 0; i < list.length; i++ ) {
			if ( list[ i ].clientId === clientId ) {
				return { list, index: i };
			}
			const nested = findWithParent( clientId, list[ i ].innerBlocks );
			if ( nested ) {
				return nested;
			}
		}
		return null;
	}

	function getBlock( clientId: string ): FakeBlock | null {
		const found = findWithParent( clientId );
		return found ? found.list[ found.index ] : null;
	}

	function getBlockParents(
		clientId: string,
		list: FakeBlock[] = blocks,
		trail: string[] = []
	): string[] {
		for ( const block of list ) {
			if ( block.clientId === clientId ) {
				return trail;
			}
			const nested = getBlockParents( clientId, block.innerBlocks, [ ...trail, block.clientId ] );
			if ( nested.length || block.innerBlocks.some( ( b ) => b.clientId === clientId ) ) {
				return nested;
			}
		}
		return [];
	}

	( window as any ).wp = {
		data: {
			select: ( store: string ) =>
				store === 'core/block-editor' ? { getBlock, getBlockParents, getBlocks: () => blocks } : {},
			dispatch: ( store: string ) =>
				store === 'core/block-editor'
					? {
							updateBlockAttributes: (
								clientId: string,
								attributes: Record< string, unknown >
							) => {
								const block = getBlock( clientId );
								if ( block ) {
									block.attributes = { ...block.attributes, ...attributes };
								}
							},
							insertBlock: ( block: FakeBlock, index = 0, rootClientId?: string ) => {
								const target = rootClientId ? getBlock( rootClientId )?.innerBlocks : blocks;
								target?.splice( index, 0, block );
							},
							removeBlock: ( clientId: string ) => {
								const found = findWithParent( clientId );
								found?.list.splice( found.index, 1 );
							},
							replaceBlock: ( clientId: string, block: FakeBlock ) => {
								const found = findWithParent( clientId );
								if ( found ) {
									found.list[ found.index ] = block;
								}
							},
							replaceInnerBlocks: ( rootClientId: string, inner: FakeBlock[] ) => {
								const block = getBlock( rootClientId );
								if ( block ) {
									block.innerBlocks = inner;
								}
							},
					  }
					: {},
		},
		blocks: {
			createBlock: (
				name: string,
				attributes: Record< string, unknown > = {},
				innerBlocks: FakeBlock[] = []
			): FakeBlock =>
				makeBlock( { clientId: `new-${ counter++ }`, name, attributes, innerBlocks } ),
			getBlockTypes: () => blockTypes.map( ( name ) => ( { name } ) ),
		},
	};

	return { getBlock, getBlocks: () => blocks };
}

afterEach( () => {
	delete ( window as any ).wp;
} );

describe( 'handleApplyBlockEdits', () => {
	it( 'applies an attribute update and reports success', async () => {
		const editor = installFakeEditor( [
			makeBlock( { clientId: 'a', name: 'core/paragraph', attributes: { content: 'old' } } ),
		] );

		const res = await handleApplyBlockEdits( {
			updates: [ { clientId: 'a', name: 'core/paragraph', attributes: { content: 'new' } } ],
			summary: 'Updated the paragraph.',
		} );

		expect( res.result.success ).toBe( true );
		expect( res.returnToAgent ).toBe( true );
		expect( editor.getBlock( 'a' )?.attributes.content ).toBe( 'new' );
	} );

	it( 'inserts a new block', async () => {
		const editor = installFakeEditor( [ makeBlock( { clientId: 'a', name: 'core/paragraph' } ) ] );

		const res = await handleApplyBlockEdits( {
			inserts: [ { block: { name: 'core/heading', attributes: { content: 'Title' } } } ],
		} );

		expect( res.result.success ).toBe( true );
		expect( editor.getBlocks() ).toHaveLength( 2 );
	} );

	it( 'deletes a block', async () => {
		const editor = installFakeEditor( [
			makeBlock( { clientId: 'a', name: 'core/paragraph' } ),
			makeBlock( { clientId: 'b', name: 'core/heading' } ),
		] );

		const res = await handleApplyBlockEdits( { deletes: [ 'a' ] } );

		expect( res.result.success ).toBe( true );
		expect( editor.getBlock( 'a' ) ).toBeNull();
		expect( editor.getBlocks() ).toHaveLength( 1 );
	} );

	it( 'returns an honest failure when the edits change nothing', async () => {
		installFakeEditor( [
			makeBlock( { clientId: 'a', name: 'core/paragraph', attributes: { content: 'same' } } ),
		] );

		const res = await handleApplyBlockEdits( {
			updates: [ { clientId: 'a', name: 'core/paragraph', attributes: { content: 'same' } } ],
		} );

		expect( res.result.success ).toBe( false );
		expect( res.returnToAgent ).toBe( true );
	} );

	it( 'refuses custom CSS instead of silently dropping it', async () => {
		const editor = installFakeEditor( [ makeBlock( { clientId: 'a', name: 'core/paragraph' } ) ] );

		const res = await handleApplyBlockEdits( { customCSS: 'body { color: red; }' } );

		expect( res.result.success ).toBe( false );
		expect( res.result.message.toLowerCase() ).toContain( 'css' );
		// Blocks are untouched by a CSS-only request.
		expect( editor.getBlocks() ).toHaveLength( 1 );
	} );

	it( 'reports an error result when a block type is not registered', async () => {
		installFakeEditor( [ makeBlock( { clientId: 'a', name: 'core/paragraph' } ) ] );

		const res = await handleApplyBlockEdits( {
			inserts: [ { block: { name: 'core/does-not-exist' } } ],
		} );

		expect( res.result.success ).toBe( false );
		expect( res.result.error ).toBeTruthy();
		expect( res.returnToAgent ).toBe( true );
	} );

	it( 'fails gracefully when the editor is unavailable', async () => {
		// No window.wp installed.
		const res = await handleApplyBlockEdits( {
			updates: [ { clientId: 'a', name: 'core/paragraph', attributes: { content: 'x' } } ],
		} );

		expect( res.result.success ).toBe( false );
		expect( res.returnToAgent ).toBe( true );
	} );
} );
