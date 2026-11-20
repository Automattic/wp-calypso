/**
 * @jest-environment jsdom
 */
import { type Mock, vi } from 'vitest';
import { isEditorPage } from '../../../utils/is-editor-page';
import { addBlockNote, addBlockNoteCallback } from '../callback';
import type { AddBlockNoteIO } from '../callback';

vi.mock( '@wordpress/data', () => ( {
	select: vi.fn( () => undefined ),
	dispatch: vi.fn( () => undefined ),
} ) );
vi.mock( '../../../utils/is-editor-page', () => ( {
	isEditorPage: vi.fn( () => true ),
} ) );

function makeIO( overrides: Partial< AddBlockNoteIO > = {} ) {
	const io = {
		getPostId: () => 5,
		getBlockMetadata: vi.fn( () => ( {} ) as unknown ),
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

describe( 'addBlockNoteCallback', () => {
	it( 'fails outside the editor', async () => {
		( isEditorPage as Mock ).mockReturnValueOnce( false );
		const { result } = await addBlockNoteCallback( input );

		expect( result.success ).toBe( false );
	} );
} );
