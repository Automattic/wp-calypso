/**
 * @jest-environment jsdom
 */
import { type Mock, vi } from 'vitest';
import { isEditorPage } from '../../../utils/is-editor-page';
import { getBlockNotes, getBlockNotesCallback } from '../callback';
import type { GetBlockNotesIO, RawNote } from '../callback';

vi.mock( '@wordpress/data', () => ( {
	select: vi.fn( () => undefined ),
	resolveSelect: vi.fn( () => undefined ),
} ) );
vi.mock( '../../../utils/is-editor-page', () => ( {
	isEditorPage: vi.fn( () => true ),
} ) );

const thread: RawNote = {
	id: 10,
	parent: 0,
	status: 'hold',
	author_name: 'Sam',
	content: { raw: 'Tighten this.' },
};

function makeIO( overrides: Partial< GetBlockNotesIO > = {} ): GetBlockNotesIO {
	return {
		getPostId: () => 5,
		getBlocksWithNoteIds: () => [ { clientId: 'b1', noteIds: [ 10 ] } ],
		fetchNotes: () =>
			Promise.resolve( [
				thread,
				{ id: 11, parent: 10, status: 'approved', author_name: 'Kim', content: { raw: 'Done.' } },
				{ id: 12, parent: 10, status: 'approved', author_name: 'Sam', content: { raw: 'Thanks.' } },
			] ),
		...overrides,
	};
}

describe( 'getBlockNotes', () => {
	it( 'groups replies under their thread and links the block', async () => {
		const { result } = await getBlockNotes( makeIO() );

		expect( result.success ).toBe( true );
		expect( result.details?.notes ).toEqual( [
			{
				id: 10,
				clientIds: [ 'b1' ],
				status: 'open',
				author: 'Sam',
				text: 'Tighten this.',
				replies: [
					{ author: 'Kim', text: 'Done.' },
					{ author: 'Sam', text: 'Thanks.' },
				],
			},
		] );
	} );

	it( 'reports an approved thread as resolved', async () => {
		const { result } = await getBlockNotes(
			makeIO( { fetchNotes: () => Promise.resolve( [ { ...thread, status: 'approved' } ] ) } )
		);

		expect( ( result.details?.notes as { status: string }[] )[ 0 ].status ).toBe( 'resolved' );
	} );

	it( 'returns a thread that no block links to', async () => {
		const { result } = await getBlockNotes( makeIO( { getBlocksWithNoteIds: () => [] } ) );

		expect( ( result.details?.notes as { clientIds: string[] }[] )[ 0 ].clientIds ).toEqual( [] );
	} );

	it( 'asks for the post to be saved when it has no id', async () => {
		const { result } = await getBlockNotes( makeIO( { getPostId: () => undefined } ) );

		expect( result.success ).toBe( false );
		expect( result.error ).toContain( 'save' );
	} );

	it( 'reports a failed fetch', async () => {
		const { result } = await getBlockNotes(
			makeIO( { fetchNotes: () => Promise.reject( new Error( 'network down' ) ) } )
		);

		expect( result.success ).toBe( false );
		expect( result.error ).toContain( 'network down' );
	} );
} );

describe( 'getBlockNotesCallback', () => {
	it( 'refuses off an editor page', async () => {
		( isEditorPage as Mock ).mockReturnValue( false );

		const { result } = await getBlockNotesCallback();

		expect( result.success ).toBe( false );
		expect( result.error ).toContain( 'editor is not open' );
	} );
} );
