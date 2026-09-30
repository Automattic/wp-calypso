jest.mock( '../../../utils/block-ids', () => ( {
	repointBlockId: jest.fn(),
	resolveClientId: jest.fn(),
} ) );
jest.mock( '../../../utils/canvas-binding', () => ( { getBlockingMove: jest.fn() } ) );
jest.mock( '../../../utils/canvas-capture', () => ( { captureCanvas: jest.fn() } ) );
jest.mock( '../../../utils/checkpoints', () => ( {
	checkpointKeys: { BLOCKS: 'blocks', CUSTOM_CSS: 'custom_css', NAVIGATION: 'navigation' },
	sealCheckpointForSwap: jest.fn(),
	withCheckpoint: jest.fn(),
} ) );
jest.mock( '../../../utils/editor-blocks', () => ( {
	getPageBlocks: jest.fn(),
	openUndoLevel: jest.fn(),
} ) );
jest.mock( '../../../utils/global-styles', () => ( {
	getCustomCss: jest.fn(),
	getEditedGlobalStyles: jest.fn(),
	setCustomCss: jest.fn(),
	waitForEditedGlobalStyles: jest.fn(),
} ) );
jest.mock( '../../../utils/is-editor-page', () => ( { isEditorPage: jest.fn() } ) );
jest.mock( '../../../utils/tool-call-history', () => ( {
	getToolCallIdFromConversationHistory: jest.fn(),
} ) );
jest.mock( '../../../utils/tracks', () => ( { recordBigSkyTracksEvent: jest.fn() } ) );
jest.mock( '../already-applied', () => ( { areUpdateEditsAlreadySatisfied: jest.fn() } ) );
jest.mock( '../apply-edits', () => ( { applyEdits: jest.fn() } ) );
jest.mock( '../../../utils/navigation-menu', () => ( { getMenuIdAround: jest.fn() } ) );
jest.mock( '../change-type', () => ( {
	getChangeType: jest.fn(),
	getEditedMenuIds: jest.fn(),
} ) );
jest.mock( '../normalize-edits', () => ( {
	hasRequestedBlockEdits: jest.fn(),
	isCssOnly: jest.fn(),
	normalizeEdits: jest.fn(),
} ) );
jest.mock( '../validation-details', () => ( {
	captureTargets: jest.fn(),
	getEditedClientIds: jest.fn(),
	getValidationDetails: jest.fn(),
	haveBlocksChanged: jest.fn(),
} ) );

import { repointBlockId, resolveClientId } from '../../../utils/block-ids';
import { getBlockingMove } from '../../../utils/canvas-binding';
import { captureCanvas } from '../../../utils/canvas-capture';
import { sealCheckpointForSwap, withCheckpoint } from '../../../utils/checkpoints';
import { getPageBlocks, openUndoLevel } from '../../../utils/editor-blocks';
import {
	getCustomCss,
	getEditedGlobalStyles,
	setCustomCss,
	waitForEditedGlobalStyles,
} from '../../../utils/global-styles';
import { isEditorPage } from '../../../utils/is-editor-page';
import { getMenuIdAround } from '../../../utils/navigation-menu';
import { getToolCallIdFromConversationHistory } from '../../../utils/tool-call-history';
import { recordBigSkyTracksEvent } from '../../../utils/tracks';
import { areUpdateEditsAlreadySatisfied } from '../already-applied';
import { applyEdits } from '../apply-edits';
import { applyBlockEditsCallback } from '../callback';
import { getChangeType, getEditedMenuIds } from '../change-type';
import { hasRequestedBlockEdits, isCssOnly, normalizeEdits } from '../normalize-edits';
import {
	captureTargets,
	getEditedClientIds,
	getValidationDetails,
	haveBlocksChanged,
} from '../validation-details';

const paragraph = ( content: string ) => ( {
	clientId: 'p1',
	name: 'core/paragraph',
	attributes: { content },
	innerBlocks: [],
} );
const update = { clientId: 'a1', name: 'core/paragraph', attributes: { content: 'New' } };
const edits = ( overrides = {} ) => ( {
	updates: [ update ],
	inserts: [],
	deletes: [],
	...overrides,
} );
const recorder = { captureMenu: jest.fn(), discardMenu: jest.fn(), markWritten: jest.fn() };
const level = { write: jest.fn(), close: jest.fn(), hasWritten: jest.fn() };
const input = { updates: [ update ], summary: 'Done.', toolCallId: 'call-1' };

const parseAgentMessage = ( agentMessage?: string ) => JSON.parse( agentMessage ?? 'null' );

// Every mock is armed here, so a value set in one test never leaks into the next.
beforeEach( () => {
	jest.resetAllMocks();
	jest.spyOn( console, 'error' ).mockImplementation( () => {} );
	jest.mocked( isEditorPage ).mockReturnValue( true );
	jest.mocked( resolveClientId ).mockImplementation( ( id ) => `resolved-${ id }` );
	jest
		.mocked( getPageBlocks )
		.mockReturnValue( { blocks: [ paragraph( 'Old' ) ], templateParts: [] } );
	jest.mocked( openUndoLevel ).mockReturnValue( level );
	level.hasWritten.mockReturnValue( true );
	jest.mocked( getCustomCss ).mockReturnValue( 'a{}' );
	const globalStyles = { id: 'gs', record: { settings: {}, styles: { css: 'a{}' } } };
	jest.mocked( waitForEditedGlobalStyles ).mockResolvedValue( globalStyles );
	jest.mocked( getEditedGlobalStyles ).mockReturnValue( globalStyles );
	jest.mocked( normalizeEdits ).mockReturnValue( edits() );
	jest
		.mocked( hasRequestedBlockEdits )
		.mockImplementation(
			( { updates, inserts, deletes } ) => updates.length + inserts.length + deletes.length > 0
		);
	jest
		.mocked( isCssOnly )
		.mockImplementation(
			( edits ) => edits.customCSS !== undefined && ! hasRequestedBlockEdits( edits )
		);
	jest.mocked( getChangeType ).mockReturnValue( 'other' );
	jest.mocked( getEditedMenuIds ).mockReturnValue( [] );
	jest.mocked( areUpdateEditsAlreadySatisfied ).mockReturnValue( false );
	jest.mocked( captureTargets ).mockReturnValue( new Map() );
	jest.mocked( getEditedClientIds ).mockReturnValue( [ 'resolved-a1' ] );
	jest
		.mocked( getValidationDetails )
		.mockReturnValue( { appliedOperations: { addedCount: 0, removedCount: 0, modifiedCount: 1 } } );
	jest.mocked( haveBlocksChanged ).mockReturnValue( true );
	jest
		.mocked( applyEdits )
		.mockResolvedValue( { recoveredTargetIds: new Set(), insertedClientIds: [] } );
	jest.mocked( captureCanvas ).mockResolvedValue( null );
	// The checkpoint engine is exercised in its own suite; here it runs the write.
	jest
		.mocked( withCheckpoint )
		.mockImplementation( ( _, write ) => Promise.resolve( write( recorder as never ) ) );
} );

afterEach( () => jest.restoreAllMocks() );

describe( 'applyBlockEditsCallback', () => {
	it( 'applies the edits under a blocks checkpoint and reports the update with its details', async () => {
		const result = await applyBlockEditsCallback( input );

		expect( withCheckpoint ).toHaveBeenCalledWith(
			{
				toolId: 'big_sky__apply_block_edits',
				toolCallId: 'call-1',
				keys: [ 'blocks' ],
				summary: 'Done.',
			},
			expect.any( Function )
		);
		expect( applyEdits ).toHaveBeenCalledWith( edits(), {
			resolve: expect.any( Function ),
			beforeWrite: expect.any( Function ),
			onReplaced: expect.any( Function ),
			level,
		} );
		expect( level.close ).toHaveBeenCalledTimes( 1 );
		expect( recorder.markWritten ).toHaveBeenCalledWith( 'blocks' );
		expect( result ).toEqual( {
			result: {
				success: true,
				message: 'Done.',
				outcome: 'updated',
				changeType: 'other',
				details: { appliedOperations: { addedCount: 0, removedCount: 0, modifiedCount: 1 } },
			},
			returnToAgent: true,
			agentMessage: expect.any( String ),
		} );
		expect( parseAgentMessage( result.agentMessage ) ).toEqual( {
			tool_id: 'big_sky__apply_block_edits',
			tool_call_id: 'call-1',
			data: { result: result.result, followUpTasks: false },
		} );
		expect( recordBigSkyTracksEvent ).toHaveBeenCalledWith( 'jetpack_big_sky_block_edits_applied', {
			outcome: 'updated',
			tool_call_id: 'call-1',
			requested_update_count: 1,
			requested_insert_count: 0,
			requested_delete_count: 0,
		} );
	} );

	it( 'seals a text-only edit for the inline undo, and nothing else', async () => {
		jest.mocked( getChangeType ).mockReturnValueOnce( 'text-content' );

		await applyBlockEditsCallback( input );
		await applyBlockEditsCallback( input );

		expect( sealCheckpointForSwap ).toHaveBeenCalledTimes( 1 );
		expect( sealCheckpointForSwap ).toHaveBeenCalledWith( 'call-1' );
	} );

	// The caller's own ids win, and a replaced block is repointed in that map.
	it( 'resolves through a supplied reverse map first, then the page structure', async () => {
		await applyBlockEditsCallback( { ...input, reverseMap: { a1: 'real-a1' } } );

		const { resolve, onReplaced } = jest.mocked( applyEdits ).mock.calls[ 0 ][ 1 ];

		expect( resolve( 'a1' ) ).toBe( 'real-a1' );
		expect( resolve( 'other' ) ).toBe( 'resolved-other' );

		onReplaced( 'a1', 'new-a1' );

		expect( resolve( 'a1' ) ).toBe( 'new-a1' );
	} );

	// A block sent by its clientId has no short id to repoint, so the call
	// itself has to follow the replacement.
	it( 'follows a replaced block for the rest of the call, and repoints its short id', async () => {
		await applyBlockEditsCallback( input );

		const { resolve, onReplaced } = jest.mocked( applyEdits ).mock.calls[ 0 ][ 1 ];

		onReplaced( 'a1', 'new-a1' );
		onReplaced( 'resolved-b2', 'new-b2' );

		expect( resolve( 'a1' ) ).toBe( 'new-a1' );
		// A replacement recorded by clientId is found through a short id too.
		expect( resolve( 'b2' ) ).toBe( 'new-b2' );
		expect( repointBlockId ).toHaveBeenCalledWith( 'a1', 'new-a1' );
	} );

	// The chat renders the agent message, so only a call the chat made gets one.
	it( 'checkpoints under the history call id but sends no agent message for it', async () => {
		jest.mocked( getToolCallIdFromConversationHistory ).mockReturnValue( 'call-h' );

		const result = await applyBlockEditsCallback( { updates: [ update ] } );

		expect( withCheckpoint ).toHaveBeenCalledWith(
			expect.objectContaining( { toolCallId: 'call-h' } ),
			expect.any( Function )
		);
		expect( result.agentMessage ).toBeUndefined();
		expect( recordBigSkyTracksEvent ).toHaveBeenCalledWith(
			'jetpack_big_sky_block_edits_applied',
			expect.objectContaining( { tool_call_id: 'call-h' } )
		);
	} );

	it( 'writes custom CSS that differs under its own domain', async () => {
		jest.mocked( normalizeEdits ).mockReturnValue( edits( { updates: [], customCSS: 'b{}' } ) );
		jest.mocked( haveBlocksChanged ).mockReturnValue( false );

		const { result } = await applyBlockEditsCallback( { customCSS: 'b{}', toolCallId: 'call-1' } );

		expect( withCheckpoint ).toHaveBeenCalledWith(
			expect.objectContaining( { keys: [ 'custom_css' ] } ),
			expect.any( Function )
		);
		expect( setCustomCss ).toHaveBeenCalledWith( expect.objectContaining( { id: 'gs' } ), 'b{}' );
		expect( recorder.markWritten ).toHaveBeenCalledWith( 'custom_css' );
		expect( result ).toEqual( expect.objectContaining( { outcome: 'updated' } ) );
		// Site-wide CSS shows anywhere on the page.
		expect( captureCanvas ).toHaveBeenCalledWith( expect.objectContaining( { fullPage: true } ) );
	} );

	it( 'skips custom CSS the page already has, claiming no domain', async () => {
		jest.mocked( normalizeEdits ).mockReturnValue( edits( { updates: [], customCSS: 'a{}' } ) );
		jest.mocked( haveBlocksChanged ).mockReturnValue( false );

		const { result } = await applyBlockEditsCallback( { customCSS: 'a{}', toolCallId: 'call-1' } );

		expect( withCheckpoint ).not.toHaveBeenCalled();
		expect( setCustomCss ).not.toHaveBeenCalled();
		expect( recorder.markWritten ).not.toHaveBeenCalled();
		expect( result ).toEqual( {
			success: true,
			message: 'The requested changes were already applied.',
			outcome: 'no-changes',
		} );
	} );

	it.each( [
		[ 'nothing was requested', { summary: 'Only words.' }, 'Only words.' ],
		[ 'the updates were already applied', input, 'Done.' ],
	] )( 'reports no changes when %s', async ( _, request, message ) => {
		jest.mocked( areUpdateEditsAlreadySatisfied ).mockReturnValue( true );
		jest
			.mocked( normalizeEdits )
			.mockReturnValue( edits( { updates: 'updates' in request ? [ update ] : [] } ) );

		const { result } = await applyBlockEditsCallback( request );

		expect( result ).toEqual( { success: true, message, outcome: 'no-changes' } );
		expect( withCheckpoint ).not.toHaveBeenCalled();
		expect( recordBigSkyTracksEvent ).toHaveBeenCalledWith(
			'jetpack_big_sky_block_edits_applied',
			expect.objectContaining( { outcome: 'no-changes' } )
		);
	} );

	it( 'reports no changes when the site already holds the CSS and the updates are satisfied', async () => {
		jest
			.mocked( areUpdateEditsAlreadySatisfied )
			.mockImplementation( ( { customCSS } ) => customCSS === undefined );
		jest.mocked( normalizeEdits ).mockReturnValue( edits( { customCSS: 'a{}' } ) );

		const { result } = await applyBlockEditsCallback( { ...input, customCSS: 'a{}' } );

		expect( result ).toEqual( expect.objectContaining( { outcome: 'no-changes' } ) );
		expect( withCheckpoint ).not.toHaveBeenCalled();
	} );

	// Decided before the menus are looked at: a satisfied edit inside one has nothing to undo either.
	it( 'reports no changes for a satisfied update inside a menu, capturing nothing', async () => {
		jest.mocked( areUpdateEditsAlreadySatisfied ).mockReturnValue( true );
		jest.mocked( getEditedMenuIds ).mockReturnValue( [ 19 ] );

		const { result } = await applyBlockEditsCallback( input );

		expect( result ).toEqual( expect.objectContaining( { outcome: 'no-changes' } ) );
		expect( withCheckpoint ).not.toHaveBeenCalled();
	} );

	it( 'fails when the edits changed nothing, without an undo', async () => {
		jest.mocked( haveBlocksChanged ).mockReturnValue( false );

		const { result } = await applyBlockEditsCallback( input );

		expect( result ).toEqual( {
			success: false,
			message: expect.stringContaining( 'I was not able to make the changes you requested' ),
			error: 'No block or CSS changes were detected after applying edits.',
		} );
		expect( recorder.markWritten ).not.toHaveBeenCalled();
	} );

	// A saved menu's items live in its record, which the page's blocks do not
	// show: the menu is captured before the edit, and that is what an undo puts back.
	it( 'captures the menu a navigation edit reaches, as the first write reaches it', async () => {
		jest.mocked( getEditedMenuIds ).mockReturnValue( [ 19 ] );
		jest
			.mocked( getMenuIdAround )
			.mockImplementation( ( clientId: string ) => ( clientId === 'link' ? 19 : undefined ) );
		jest.mocked( getChangeType ).mockReturnValue( 'text-content' );
		jest.mocked( haveBlocksChanged ).mockReturnValue( false );

		const { result } = await applyBlockEditsCallback( input );

		// Its checkpoint holds the menu too, which the inline swap cannot take back.
		expect( result.changeType ).toBe( 'other' );
		expect( sealCheckpointForSwap ).not.toHaveBeenCalled();

		expect( withCheckpoint ).toHaveBeenCalledWith(
			expect.objectContaining( { keys: [ 'blocks', 'navigation' ] } ),
			expect.any( Function )
		);

		// Not captured up front: a batch that fails before the menu keeps no undo for it.
		const { beforeWrite } = jest.mocked( applyEdits ).mock.calls[ 0 ][ 1 ];

		expect( recorder.captureMenu ).not.toHaveBeenCalled();

		await beforeWrite( 'para' );
		await beforeWrite( 'link' );

		expect( recorder.captureMenu.mock.calls ).toEqual( [ [ 19 ] ] );
		expect( recorder.markWritten ).not.toHaveBeenCalled();
		expect( result ).toEqual( expect.objectContaining( { outcome: 'updated' } ) );
	} );

	// The snapshot is taken just before the write; a write that then fails leaves nothing to undo.
	it( 'discards a menu captured for a batch that wrote nothing', async () => {
		jest.mocked( getEditedMenuIds ).mockReturnValue( [ 19 ] );
		jest.mocked( getMenuIdAround ).mockReturnValue( 19 );
		recorder.captureMenu.mockResolvedValue( true );
		level.hasWritten.mockReturnValue( false );
		jest.mocked( applyEdits ).mockImplementation( async ( _, { beforeWrite } ) => {
			await beforeWrite( 'link' );
			throw new Error( 'Stopped' );
		} );

		await applyBlockEditsCallback( input );

		expect( recorder.discardMenu ).toHaveBeenCalledWith( 19 );
	} );

	// The user may be scrolled anywhere; the capture frames what the call added.
	it( 'frames the capture on the inserted blocks too', async () => {
		jest.mocked( applyEdits ).mockResolvedValue( {
			recoveredTargetIds: new Set(),
			insertedClientIds: [ 'new-1' ],
		} );

		await applyBlockEditsCallback( input );

		expect( captureCanvas ).toHaveBeenCalledWith( {
			clientIds: [ 'resolved-a1', 'new-1' ],
			fullPage: false,
		} );
	} );

	// The writes that landed stay in place, so the checkpoint is the way back.
	it( 'keeps the checkpoint when the apply fails after editing began', async () => {
		jest.mocked( applyEdits ).mockRejectedValue( new Error( 'Parent block not found' ) );

		const { result } = await applyBlockEditsCallback( input );

		expect( result ).toEqual( {
			success: false,
			message: 'Something went wrong. Please try again.',
			error: 'Parent block not found',
		} );
		expect( recorder.markWritten ).toHaveBeenCalledWith( 'blocks' );
		expect( recordBigSkyTracksEvent ).toHaveBeenCalledWith(
			'jetpack_big_sky_block_edits_applied',
			expect.objectContaining( { outcome: 'failed' } )
		);
	} );

	// The page was not touched, so a picture of it would only cost time.
	it( 'fails an invalid request before any checkpoint, capturing nothing', async () => {
		jest.mocked( normalizeEdits ).mockImplementation( () => {
			throw new Error( 'Updates must be an array' );
		} );

		const result = await applyBlockEditsCallback( { updates: 'nope', toolCallId: 'call-1' } );

		expect( withCheckpoint ).not.toHaveBeenCalled();
		expect( result.result ).toEqual(
			expect.objectContaining( { success: false, error: 'Updates must be an array' } )
		);
		expect( captureCanvas ).not.toHaveBeenCalled();
		expect( result.__file_parts ).toBeUndefined();
	} );

	// The page on screen is not the one the call edited.
	it.each( [
		[ 'keeps the blocks domain for the writes that landed', true ],
		[ 'drops the blocks domain when nothing was written', false ],
	] )( 'captures nothing once the canvas has moved, and %s', async ( _, written ) => {
		jest.mocked( getBlockingMove ).mockReturnValue( { from: 'Home', to: 'About' } );
		jest.mocked( applyEdits ).mockRejectedValue( new Error( 'Stopped' ) );
		level.hasWritten.mockReturnValue( written );

		const { result } = await applyBlockEditsCallback( input );

		expect( result.success ).toBe( false );
		expect( captureCanvas ).not.toHaveBeenCalled();
		// The page on screen is another one, so only the writes decide.
		expect( haveBlocksChanged ).not.toHaveBeenCalled();
		expect( recorder.markWritten.mock.calls ).toEqual( written ? [ [ 'blocks' ] ] : [] );
	} );

	it( 'takes an input that is not an object as an empty request', async () => {
		await applyBlockEditsCallback( null );

		expect( normalizeEdits ).toHaveBeenCalledWith( {} );
	} );

	it( 'refuses off the editor', async () => {
		jest.mocked( isEditorPage ).mockReturnValue( false );

		const { result } = await applyBlockEditsCallback( input );

		expect( result ).toEqual( expect.objectContaining( { success: false } ) );
		expect( withCheckpoint ).not.toHaveBeenCalled();
		expect( recordBigSkyTracksEvent ).not.toHaveBeenCalled();
	} );

	// The flag ships only with an image: the chat withholds the summary on its
	// strength, and with nothing to look at the server's reply never comes.
	it.each( [
		[ 'with a capture', [ { type: 'file', file: { name: 'canvas.webp' } } ], true ],
		[ 'without one', null, undefined ],
	] )( 'forwards visualCheckPending %s', async ( _, parts, forwarded ) => {
		jest.mocked( captureCanvas ).mockResolvedValue( parts as never );

		const result = await applyBlockEditsCallback( {
			...input,
			visualCheckPending: true,
			followUpTasks: true,
		} );

		expect( captureCanvas ).toHaveBeenCalledWith( {
			clientIds: [ 'resolved-a1' ],
			fullPage: false,
		} );
		expect( parseAgentMessage( result.agentMessage ).data ).toEqual( {
			result: result.result,
			followUpTasks: true,
			...( forwarded && { visualCheckPending: true } ),
		} );
		expect( result.__file_parts ).toEqual( parts ?? undefined );
	} );
} );
