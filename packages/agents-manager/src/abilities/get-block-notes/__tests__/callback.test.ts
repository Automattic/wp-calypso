/**
 * @jest-environment jsdom
 */
import { resolveSelect, select } from '@wordpress/data';
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
		getPostAuthor: () => ( { authorName: 'Sam', authorIsCurrentUser: false } ),
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

	it( 'says who wrote the post, so the agent knows where feedback goes', async () => {
		const { result } = await getBlockNotes( makeIO() );

		expect( result.details?.post ).toEqual( { authorName: 'Sam', authorIsCurrentUser: false } );
	} );

	it( 'says who wrote an unsaved post too', async () => {
		const { result } = await getBlockNotes(
			makeIO( {
				getPostId: () => 'auto-draft',
				getPostAuthor: () => ( { authorName: 'Me', authorIsCurrentUser: true } ),
			} )
		);

		expect( result.details ).toEqual( {
			notes: [],
			post: { authorName: 'Me', authorIsCurrentUser: true },
		} );
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

	it( 'returns no notes for an auto-draft', async () => {
		const io = makeIO( { getPostId: () => 'auto-draft', fetchNotes: vi.fn() } );
		const { result } = await getBlockNotes( io );

		expect( result.success ).toBe( true );
		expect( result.details?.notes ).toEqual( [] );
		expect( io.fetchNotes ).not.toHaveBeenCalled();
	} );

	it( 'refuses a non-post editor', async () => {
		const { result } = await getBlockNotes( makeIO( { getPostId: () => 'unsupported' } ) );

		expect( result.success ).toBe( false );
		expect( result.error ).toBe( 'Notes work only on posts and pages.' );
	} );

	it( 'sorts replies by ascending id', async () => {
		const { result } = await getBlockNotes(
			makeIO( {
				fetchNotes: () =>
					Promise.resolve( [
						thread,
						{ id: 13, parent: 10, status: 'approved', author_name: 'B', content: { raw: 'Late.' } },
						{
							id: 11,
							parent: 10,
							status: 'approved',
							author_name: 'A',
							content: { raw: 'Early.' },
						},
					] ),
			} )
		);

		expect( ( result.details?.notes as { replies: { text: string }[] }[] )[ 0 ].replies ).toEqual( [
			{ author: 'A', text: 'Early.' },
			{ author: 'B', text: 'Late.' },
		] );
	} );

	it( 'maps empty resolve and reopen replies to readable events', async () => {
		const { result } = await getBlockNotes(
			makeIO( {
				fetchNotes: () =>
					Promise.resolve( [
						thread,
						{
							id: 11,
							parent: 10,
							status: 'approved',
							author_name: 'Kim',
							content: { raw: '' },
							meta: { _wp_note_status: 'resolved' },
						},
						{
							id: 12,
							parent: 10,
							status: 'approved',
							author_name: 'Sam',
							content: { raw: '' },
							meta: { _wp_note_status: 'reopen' },
						},
						{
							id: 13,
							parent: 10,
							status: 'approved',
							author_name: 'Kim',
							content: { raw: 'Fixed it.' },
							meta: { _wp_note_status: 'resolved' },
						},
					] ),
			} )
		);

		expect( ( result.details?.notes as { replies: unknown[] }[] )[ 0 ].replies ).toEqual( [
			{ author: 'Kim', text: 'Marked as resolved' },
			{ author: 'Sam', text: 'Reopened' },
			{ author: 'Kim', text: 'Fixed it.' },
		] );
	} );

	it( 'reads escaped raw text back as the original text', async () => {
		const { result } = await getBlockNotes(
			makeIO( {
				fetchNotes: () =>
					Promise.resolve( [
						{
							...thread,
							content: { raw: 'AI review: change &lt;h3&gt; to &lt;h2&gt; &amp; more' },
						},
					] ),
			} )
		);

		expect( ( result.details?.notes as { text: string }[] )[ 0 ].text ).toBe(
			'AI review: change <h3> to <h2> & more'
		);
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

describe( 'getBlockNotesCallback wiring', () => {
	it( 'fetches every note with per_page -1', async () => {
		( isEditorPage as Mock ).mockReturnValue( true );
		const getEntityRecords = vi.fn( () => Promise.resolve( [] ) );
		( resolveSelect as Mock ).mockReturnValue( { getEntityRecords } );
		( select as Mock ).mockReturnValue( {
			getCurrentPostId: () => 5,
			getCurrentPostAttribute: () => 'draft',
		} );

		await getBlockNotesCallback();

		expect( getEntityRecords ).toHaveBeenCalledWith(
			'root',
			'comment',
			expect.objectContaining( { post: 5, per_page: -1 } )
		);
	} );
	it( 'compares the post author with the current user', async () => {
		( isEditorPage as Mock ).mockReturnValue( true );
		( resolveSelect as Mock ).mockReturnValue( {
			getEntityRecords: () => Promise.resolve( [] ),
		} );
		( select as Mock ).mockImplementation( ( store: string ) =>
			store === 'core'
				? { getCurrentUser: () => ( { id: 7 } ), getUser: () => ( { name: 'Ana' } ) }
				: {
						getCurrentPostId: () => 5,
						getCurrentPostAttribute: ( name: string ) => ( name === 'author' ? 7 : 'draft' ),
					}
		);

		const { result } = await getBlockNotesCallback();

		expect( result.details?.post ).toEqual( { authorName: 'Ana', authorIsCurrentUser: true } );
	} );
} );
