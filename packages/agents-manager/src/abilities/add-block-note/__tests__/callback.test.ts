/**
 * @jest-environment jsdom
 */
import { dispatch, resolveSelect, select } from '@wordpress/data';
import { type Mock, vi } from 'vitest';
import { isEditorPage } from '../../../utils/is-editor-page';
import { addBlockNote, addBlockNoteCallback } from '../callback';
import type { AddBlockNoteIO } from '../callback';

vi.mock( '@wordpress/data', () => ( {
	select: vi.fn( () => undefined ),
	dispatch: vi.fn( () => undefined ),
	resolveSelect: vi.fn( () => undefined ),
} ) );
vi.mock( '../../../utils/is-editor-page', () => ( {
	isEditorPage: vi.fn( () => true ),
} ) );

function makeIO( overrides: Partial< AddBlockNoteIO > = {} ) {
	const io = {
		getPostId: () => 5,
		getBlockMetadata: vi.fn( () => ( {} ) as unknown ),
		getNoteBlockRefusal: vi.fn( () => null as string | null ),
		getNoteStatus: vi.fn( () => Promise.resolve( 'open' as 'open' | 'resolved' | 'missing' ) ),
		reopenNote: vi.fn( () => Promise.resolve() ),
		saveNote: vi.fn( () => Promise.resolve( { id: 99 } ) ),
		setBlockMetadata: vi.fn(),
		prefix: 'AI review:',
		...overrides,
	};
	return io satisfies AddBlockNoteIO;
}

const input = { clientId: 'b1', text: 'Split this sentence.' };

describe( 'addBlockNote', () => {
	it( 'creates a note and links it to a block with no note', async () => {
		const io = makeIO();
		const { result } = await addBlockNote( io, input );

		expect( io.saveNote ).toHaveBeenCalledWith( {
			post: 5,
			content: 'AI review: Split this sentence.',
			status: 'hold',
			type: 'note',
			parent: 0,
		} );
		expect( io.setBlockMetadata ).toHaveBeenCalledWith( 'b1', { noteId: 99 } );
		expect( result.success ).toBe( true );
		expect( result.details ).toMatchObject( { noteId: 99, threadId: 99, replied: false } );
		expect( result.details?.nextStep ).toMatch( /save the post/i );
	} );

	it( 'keeps other metadata when linking the note', async () => {
		const io = makeIO( { getBlockMetadata: vi.fn( () => ( { name: 'Intro' } ) ) } );
		await addBlockNote( io, input );

		expect( io.setBlockMetadata ).toHaveBeenCalledWith( 'b1', { name: 'Intro', noteId: 99 } );
	} );

	it( 'replies to the thread when the block has a numeric note id', async () => {
		const io = makeIO( { getBlockMetadata: vi.fn( () => ( { noteId: 40 } ) ) } );
		const { result } = await addBlockNote( io, input );

		expect( io.saveNote ).toHaveBeenCalledWith( expect.objectContaining( { parent: 40 } ) );
		expect( io.setBlockMetadata ).not.toHaveBeenCalled();
		expect( result.details ).toMatchObject( { noteId: 99, threadId: 40, replied: true } );
	} );

	it( 'replies to the first note when the block has several', async () => {
		const io = makeIO( { getBlockMetadata: vi.fn( () => ( { noteId: [ 40, 41 ] } ) ) } );
		await addBlockNote( io, input );

		expect( io.saveNote ).toHaveBeenCalledWith( expect.objectContaining( { parent: 40 } ) );
		expect( io.setBlockMetadata ).not.toHaveBeenCalled();
	} );

	it( 'fails when the block does not exist', async () => {
		const io = makeIO( { getBlockMetadata: vi.fn( () => null ) } );
		const { result } = await addBlockNote( io, input );

		expect( result.success ).toBe( false );
		expect( io.saveNote ).not.toHaveBeenCalled();
	} );

	it( 'fails when the post has no id', async () => {
		const io = makeIO( { getPostId: () => undefined } );
		const { result } = await addBlockNote( io, input );

		expect( result.success ).toBe( false );
		expect( io.saveNote ).not.toHaveBeenCalled();
	} );

	it( 'asks to save an auto-draft first', async () => {
		const io = makeIO( { getPostId: () => 'auto-draft' } );
		const { result } = await addBlockNote( io, input );

		expect( result.success ).toBe( false );
		expect( result.error ).toMatch( /save the post/i );
		expect( io.saveNote ).not.toHaveBeenCalled();
	} );

	it( 'refuses a non-post editor', async () => {
		const io = makeIO( { getPostId: () => 'unsupported' } );
		const { result } = await addBlockNote( io, input );

		expect( result.success ).toBe( false );
		expect( result.error ).toBe( 'Notes work only on posts and pages.' );
		expect( io.saveNote ).not.toHaveBeenCalled();
	} );

	it( 'refuses blocks that do not belong to the post', async () => {
		const io = makeIO( {
			getNoteBlockRefusal: vi.fn( () => 'Notes can only go on blocks of the open post.' ),
		} );
		const { result } = await addBlockNote( io, input );

		expect( result.success ).toBe( false );
		expect( result.error ).toContain( 'open post' );
		expect( io.saveNote ).not.toHaveBeenCalled();
		expect( io.setBlockMetadata ).not.toHaveBeenCalled();
	} );

	it( 'replies to the first open thread, skipping a resolved one', async () => {
		const io = makeIO( {
			getBlockMetadata: vi.fn( () => ( { noteId: [ 40, 41 ] } ) ),
			getNoteStatus: vi.fn( ( id: number ) =>
				Promise.resolve( id === 40 ? ( 'resolved' as const ) : ( 'open' as const ) )
			),
		} );
		const { result } = await addBlockNote( io, input );

		expect( io.saveNote ).toHaveBeenCalledWith( expect.objectContaining( { parent: 41 } ) );
		expect( io.reopenNote ).not.toHaveBeenCalled();
		expect( result.details ).toMatchObject( { threadId: 41, replied: true } );
	} );

	it( 'reopens a resolved thread and replies with the reopen status', async () => {
		const io = makeIO( {
			getBlockMetadata: vi.fn( () => ( { noteId: 40 } ) ),
			getNoteStatus: vi.fn( () => Promise.resolve( 'resolved' as const ) ),
		} );
		const { result } = await addBlockNote( io, input );

		expect( io.reopenNote ).toHaveBeenCalledWith( 40 );
		expect( io.saveNote ).toHaveBeenCalledWith(
			expect.objectContaining( { parent: 40, meta: { _wp_note_status: 'reopen' } } )
		);
		expect( result.details ).toMatchObject( { replied: true, reopened: true, threadId: 40 } );
	} );

	it( 'does not save a reply when the reopen fails', async () => {
		const io = makeIO( {
			getBlockMetadata: vi.fn( () => ( { noteId: 40 } ) ),
			getNoteStatus: vi.fn( () => Promise.resolve( 'resolved' as const ) ),
			reopenNote: vi.fn( () => Promise.reject( new Error( 'no permission' ) ) ),
		} );
		const { result } = await addBlockNote( io, input );

		expect( result.success ).toBe( false );
		expect( result.error ).toContain( 'no permission' );
		expect( io.saveNote ).not.toHaveBeenCalled();
	} );

	it( 'starts a new thread when every linked note is missing', async () => {
		const io = makeIO( {
			getBlockMetadata: vi.fn( () => ( { name: 'Intro', noteId: [ 40, 41 ] } ) ),
			getNoteStatus: vi.fn( () => Promise.resolve( 'missing' as const ) ),
		} );
		const { result } = await addBlockNote( io, input );

		expect( io.saveNote ).toHaveBeenCalledWith( expect.objectContaining( { parent: 0 } ) );
		expect( io.setBlockMetadata ).toHaveBeenCalledWith( 'b1', { name: 'Intro', noteId: 99 } );
		expect( result.details ).toMatchObject( { replied: false, threadId: 99 } );
	} );

	it( 'saves angle brackets and ampersands as escaped text', async () => {
		const io = makeIO();
		await addBlockNote( io, { clientId: 'b1', text: 'change <h3> to <h2> & <a href="x">y</a>' } );

		expect( io.saveNote ).toHaveBeenCalledWith(
			expect.objectContaining( {
				content: 'AI review: change &lt;h3&gt; to &lt;h2&gt; &amp; &lt;a href="x"&gt;y&lt;/a&gt;',
			} )
		);
	} );

	it( 'links the note to fresh metadata read after the save', async () => {
		const getBlockMetadata = vi
			.fn()
			.mockReturnValueOnce( {} )
			.mockReturnValue( { name: 'Changed while saving' } );
		const io = makeIO( { getBlockMetadata } );
		await addBlockNote( io, input );

		expect( io.setBlockMetadata ).toHaveBeenCalledWith( 'b1', {
			name: 'Changed while saving',
			noteId: 99,
		} );
	} );

	it( 'reports an unlinked note when the block is gone after the save', async () => {
		const getBlockMetadata = vi.fn().mockReturnValueOnce( {} ).mockReturnValue( null );
		const io = makeIO( { getBlockMetadata } );
		const { result } = await addBlockNote( io, input );

		expect( result.success ).toBe( true );
		expect( io.setBlockMetadata ).not.toHaveBeenCalled();
		expect( result.details ).toMatchObject( { noteId: 99, linked: false } );
		expect( result.details?.nextStep ).toMatch( /removed/i );
	} );

	it( 'returns an error when linking the block throws', async () => {
		const io = makeIO( {
			setBlockMetadata: vi.fn( () => {
				throw new Error( 'cannot update block' );
			} ),
		} );
		const { result } = await addBlockNote( io, input );

		expect( result.success ).toBe( false );
		expect( result.error ).toContain( 'cannot update block' );
	} );

	it( 'fails without throwing on non-string input', async () => {
		const io = makeIO();
		const bad = await addBlockNote( io, { clientId: 'b1', text: 5 } as never );
		const bad2 = await addBlockNote( io, { clientId: 7, text: 'x' } as never );

		expect( bad.result.success ).toBe( false );
		expect( bad2.result.success ).toBe( false );
		expect( io.saveNote ).not.toHaveBeenCalled();
	} );

	it( 'fails on empty text', async () => {
		const io = makeIO();
		const { result } = await addBlockNote( io, { clientId: 'b1', text: '   ' } );

		expect( result.success ).toBe( false );
		expect( io.saveNote ).not.toHaveBeenCalled();
	} );

	it( 'fails on text over 2000 characters', async () => {
		const io = makeIO();
		const { result } = await addBlockNote( io, { clientId: 'b1', text: 'a'.repeat( 2001 ) } );

		expect( result.success ).toBe( false );
		expect( io.saveNote ).not.toHaveBeenCalled();
	} );

	it( 'returns the save error and does not link the block', async () => {
		const io = makeIO( {
			saveNote: vi.fn( () =>
				Promise.reject( new Error( 'Sorry, you are not allowed to create notes.' ) )
			),
		} );
		const { result } = await addBlockNote( io, input );

		expect( result.success ).toBe( false );
		expect( result.error ).toContain( 'Sorry, you are not allowed to create notes.' );
		expect( io.setBlockMetadata ).not.toHaveBeenCalled();
	} );
} );

describe( 'addBlockNoteCallback wiring', () => {
	function wire( blockName = 'core/paragraph', extra: Record< string, unknown > = {} ) {
		const saveEntityRecord = vi.fn( ( _k, _n, record: { id?: number } ) =>
			Promise.resolve( { id: record.id ?? 77 } )
		);
		const updateBlockAttributes = vi.fn();
		const mark = vi.fn();
		const order: string[] = [];
		mark.mockImplementation( () => order.push( 'mark' ) );
		updateBlockAttributes.mockImplementation( () => order.push( 'update' ) );
		( select as Mock ).mockImplementation( ( store: string ) =>
			store === 'core/editor'
				? { getCurrentPostId: () => 5, getCurrentPostAttribute: () => 'draft' }
				: {
						getBlock: () => ( { name: blockName, attributes: {} } ),
						getBlockEditingMode: () => 'default',
						getBlockParentsByBlockName: () => [],
						...extra,
					}
		);
		( dispatch as Mock ).mockImplementation( ( store: string ) =>
			store === 'core'
				? { saveEntityRecord }
				: { updateBlockAttributes, __unstableMarkNextChangeAsNotPersistent: mark }
		);
		return { saveEntityRecord, updateBlockAttributes, order };
	}

	it( 'marks the metadata change as not persistent before updating', async () => {
		const { order, updateBlockAttributes } = wire();
		( resolveSelect as Mock ).mockReturnValue( {} );
		await addBlockNoteCallback( input );

		expect( updateBlockAttributes ).toHaveBeenCalledWith( 'b1', { metadata: { noteId: 77 } } );
		expect( order ).toEqual( [ 'mark', 'update' ] );
	} );

	it.each( [
		[ 'core/template-part', {} ],
		[ 'core/block', {} ],
		[ 'core/freeform', {} ],
		[ 'core/paragraph', { getBlockEditingMode: () => 'disabled' } ],
		[ 'core/paragraph', { getBlockParentsByBlockName: () => [ 'p1' ] } ],
	] )( 'refuses %s with %j', async ( name, extra ) => {
		const { saveEntityRecord } = wire( name, extra );
		const { result } = await addBlockNoteCallback( input );

		expect( result.success ).toBe( false );
		expect( result.error ).toMatch( /belong to the open post/ );
		expect( saveEntityRecord ).not.toHaveBeenCalled();
	} );

	it( 'maps comment statuses and reopens through the core store', async () => {
		const { saveEntityRecord } = wire( 'core/paragraph', {
			getBlock: () => ( {
				name: 'core/paragraph',
				attributes: { metadata: { noteId: [ 1, 2, 3 ] } },
			} ),
		} );
		const records: Record< number, unknown > = {
			1: { status: 'trash' },
			2: { status: 'approved' },
			3: null,
		};
		( resolveSelect as Mock ).mockReturnValue( {
			getEntityRecord: ( _k: string, _n: string, id: number ) =>
				id === 3 ? Promise.reject( new Error( 'gone' ) ) : Promise.resolve( records[ id ] ),
		} );
		const { result } = await addBlockNoteCallback( input );

		expect( saveEntityRecord ).toHaveBeenNthCalledWith(
			1,
			'root',
			'comment',
			{ id: 2, status: 'hold' },
			{ throwOnError: true }
		);
		expect( saveEntityRecord ).toHaveBeenNthCalledWith(
			2,
			'root',
			'comment',
			expect.objectContaining( { parent: 2, meta: { _wp_note_status: 'reopen' } } ),
			{ throwOnError: true }
		);
		expect( result.details ).toMatchObject( { reopened: true } );
	} );

	it( 'returns an error when the editor cannot update blocks', async () => {
		wire();
		( dispatch as Mock ).mockImplementation( ( store: string ) =>
			store === 'core' ? { saveEntityRecord: () => Promise.resolve( { id: 9 } ) } : {}
		);
		const { result } = await addBlockNoteCallback( input );

		expect( result.success ).toBe( false );
		expect( result.error ).toContain( 'note id 9' );
	} );
} );

describe( 'addBlockNoteCallback', () => {
	it( 'fails outside the editor', async () => {
		( isEditorPage as Mock ).mockReturnValueOnce( false );
		const { result } = await addBlockNoteCallback( input );

		expect( result.success ).toBe( false );
	} );
} );
