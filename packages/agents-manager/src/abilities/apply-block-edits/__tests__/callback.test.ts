import { vi } from 'vitest';
vi.mock( '../../../utils/block-ids', () => ( {
	repointBlockId: vi.fn(),
	resolveClientId: vi.fn(),
} ) );
vi.mock( '../../../utils/canvas-binding', () => ( { getBlockingMove: vi.fn() } ) );
// The capture and the canvas measurements are stubbed; the sentences describing
// what came back are pure and stay real, so the assertions here exercise them.
vi.mock( '../../../utils/canvas-capture', async () => ( {
	...( await vi.importActual< typeof import( '../../../utils/canvas-capture' ) >(
		'../../../utils/canvas-capture'
	) ),
	captureCanvas: vi.fn(),
	describeMeasuredLayout: vi.fn(),
	describeTextContrast: vi.fn(),
	describeUnmoved: vi.fn(),
	snapshotLayout: vi.fn(),
} ) );
vi.mock( '../../../utils/checkpoints', () => ( {
	checkpointKeys: { BLOCKS: 'blocks', CUSTOM_CSS: 'custom_css', NAVIGATION: 'navigation' },
	sealCheckpointForSwap: vi.fn(),
	withCheckpoint: vi.fn(),
} ) );
vi.mock( '../../../utils/editor-blocks', () => ( {
	getPageBlocks: vi.fn(),
	openUndoLevel: vi.fn(),
} ) );
vi.mock( '../../../utils/global-styles', () => ( {
	getCustomCss: vi.fn(),
	getEditedGlobalStyles: vi.fn(),
	setCustomCss: vi.fn(),
	waitForEditedGlobalStyles: vi.fn(),
} ) );
vi.mock( '../../../utils/is-editor-page', () => ( { isEditorPage: vi.fn() } ) );
vi.mock( '../../../utils/tool-call-history', () => ( {
	getToolCallIdFromConversationHistory: vi.fn(),
} ) );
vi.mock( '../../../utils/tracks', () => ( { recordBigSkyTracksEvent: vi.fn() } ) );
vi.mock( '../already-applied', () => ( { areUpdateEditsAlreadySatisfied: vi.fn() } ) );
vi.mock( '../apply-edits', () => ( { applyEdits: vi.fn() } ) );
vi.mock( '../../../utils/navigation-menu', () => ( { getMenuIdAround: vi.fn() } ) );
vi.mock( '../change-type', () => ( {
	getChangeType: vi.fn(),
	getEditedMenuIds: vi.fn(),
} ) );
vi.mock( '../normalize-edits', () => ( {
	hasRequestedBlockEdits: vi.fn(),
	isCssOnly: vi.fn(),
	normalizeEdits: vi.fn(),
} ) );
vi.mock( '../validation-details', () => ( {
	captureTargets: vi.fn(),
	getEditedClientIds: vi.fn(),
	getValidationDetails: vi.fn(),
	haveBlocksChanged: vi.fn(),
} ) );

import { repointBlockId, resolveClientId } from '../../../utils/block-ids';
import { getBlockingMove } from '../../../utils/canvas-binding';
import {
	captureCanvas,
	describeMeasuredLayout,
	describeTextContrast,
	describeUnmoved,
	snapshotLayout,
} from '../../../utils/canvas-capture';
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
const recorder = { captureMenu: vi.fn(), discardMenu: vi.fn(), markWritten: vi.fn() };
const level = { write: vi.fn(), close: vi.fn(), hasWritten: vi.fn() };
const input = { updates: [ update ], summary: 'Done.', toolCallId: 'call-1' };

const parseAgentMessage = ( agentMessage?: string ) => JSON.parse( agentMessage ?? 'null' );

// Every mock is armed here, so a value set in one test never leaks into the next.
beforeEach( () => {
	vi.resetAllMocks();
	vi.spyOn( console, 'error' ).mockImplementation( () => {} );
	vi.mocked( isEditorPage ).mockReturnValue( true );
	vi.mocked( resolveClientId ).mockImplementation( ( id ) => `resolved-${ id }` );
	vi.mocked( getPageBlocks ).mockReturnValue( {
		blocks: [ paragraph( 'Old' ) ],
		templateParts: [],
	} );
	vi.mocked( openUndoLevel ).mockReturnValue( level );
	level.hasWritten.mockReturnValue( true );
	vi.mocked( getCustomCss ).mockReturnValue( 'a{}' );
	const globalStyles = { id: 'gs', record: { settings: {}, styles: { css: 'a{}' } } };
	vi.mocked( waitForEditedGlobalStyles ).mockResolvedValue( globalStyles );
	vi.mocked( getEditedGlobalStyles ).mockReturnValue( globalStyles );
	vi.mocked( normalizeEdits ).mockReturnValue( edits() );
	vi.mocked( hasRequestedBlockEdits ).mockImplementation(
		( { updates, inserts, deletes } ) => updates.length + inserts.length + deletes.length > 0
	);
	vi.mocked( isCssOnly ).mockImplementation(
		( edits ) => edits.customCSS !== undefined && ! hasRequestedBlockEdits( edits )
	);
	vi.mocked( getChangeType ).mockReturnValue( 'other' );
	vi.mocked( getEditedMenuIds ).mockReturnValue( [] );
	vi.mocked( areUpdateEditsAlreadySatisfied ).mockReturnValue( false );
	vi.mocked( captureTargets ).mockReturnValue( new Map() );
	vi.mocked( getEditedClientIds ).mockReturnValue( [ 'resolved-a1' ] );
	vi.mocked( getValidationDetails ).mockReturnValue( {
		appliedOperations: { addedCount: 0, removedCount: 0, modifiedCount: 1 },
	} );
	vi.mocked( haveBlocksChanged ).mockReturnValue( true );
	vi.mocked( applyEdits ).mockResolvedValue( {
		recoveredTargetIds: new Set(),
		insertedClientIds: [],
	} );
	vi.mocked( captureCanvas ).mockResolvedValue( null );
	vi.mocked( describeMeasuredLayout ).mockReturnValue( [] );
	vi.mocked( describeTextContrast ).mockReturnValue( null );
	vi.mocked( snapshotLayout ).mockReturnValue( null );
	vi.mocked( describeUnmoved ).mockReturnValue( '' );
	// The checkpoint engine is exercised in its own suite; here it runs the write.
	vi.mocked( withCheckpoint ).mockImplementation( ( _, write ) =>
		Promise.resolve( write( recorder as never ) )
	);
} );

afterEach( () => vi.restoreAllMocks() );

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
		vi.mocked( getChangeType ).mockReturnValueOnce( 'text-content' );

		await applyBlockEditsCallback( input );
		await applyBlockEditsCallback( input );

		expect( sealCheckpointForSwap ).toHaveBeenCalledTimes( 1 );
		expect( sealCheckpointForSwap ).toHaveBeenCalledWith( 'call-1' );
	} );

	// The caller's own ids win, and a replaced block is repointed in that map.
	it( 'resolves through a supplied reverse map first, then the page structure', async () => {
		await applyBlockEditsCallback( { ...input, reverseMap: { a1: 'real-a1' } } );

		const { resolve, onReplaced } = vi.mocked( applyEdits ).mock.calls[ 0 ][ 1 ];

		expect( resolve( 'a1' ) ).toBe( 'real-a1' );
		expect( resolve( 'other' ) ).toBe( 'resolved-other' );

		onReplaced( 'a1', 'new-a1' );

		expect( resolve( 'a1' ) ).toBe( 'new-a1' );
	} );

	// A block sent by its clientId has no short id to repoint, so the call
	// itself has to follow the replacement.
	it( 'follows a replaced block for the rest of the call, and repoints its short id', async () => {
		await applyBlockEditsCallback( input );

		const { resolve, onReplaced } = vi.mocked( applyEdits ).mock.calls[ 0 ][ 1 ];

		onReplaced( 'a1', 'new-a1' );
		onReplaced( 'resolved-b2', 'new-b2' );

		expect( resolve( 'a1' ) ).toBe( 'new-a1' );
		// A replacement recorded by clientId is found through a short id too.
		expect( resolve( 'b2' ) ).toBe( 'new-b2' );
		expect( repointBlockId ).toHaveBeenCalledWith( 'a1', 'new-a1' );
	} );

	// The chat renders the agent message, so only a call the chat made gets one.
	it( 'checkpoints under the history call id but sends no agent message for it', async () => {
		vi.mocked( getToolCallIdFromConversationHistory ).mockReturnValue( 'call-h' );

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
		vi.mocked( normalizeEdits ).mockReturnValue( edits( { updates: [], customCSS: 'b{}' } ) );
		vi.mocked( haveBlocksChanged ).mockReturnValue( false );

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
		vi.mocked( normalizeEdits ).mockReturnValue( edits( { updates: [], customCSS: 'a{}' } ) );
		vi.mocked( haveBlocksChanged ).mockReturnValue( false );

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
		vi.mocked( areUpdateEditsAlreadySatisfied ).mockReturnValue( true );
		vi.mocked( normalizeEdits ).mockReturnValue(
			edits( { updates: 'updates' in request ? [ update ] : [] } )
		);

		const { result } = await applyBlockEditsCallback( request );

		expect( result ).toEqual( { success: true, message, outcome: 'no-changes' } );
		expect( withCheckpoint ).not.toHaveBeenCalled();
		expect( recordBigSkyTracksEvent ).toHaveBeenCalledWith(
			'jetpack_big_sky_block_edits_applied',
			expect.objectContaining( { outcome: 'no-changes' } )
		);
	} );

	it( 'reports no changes when the site already holds the CSS and the updates are satisfied', async () => {
		vi.mocked( areUpdateEditsAlreadySatisfied ).mockImplementation(
			( { customCSS } ) => customCSS === undefined
		);
		vi.mocked( normalizeEdits ).mockReturnValue( edits( { customCSS: 'a{}' } ) );

		const { result } = await applyBlockEditsCallback( { ...input, customCSS: 'a{}' } );

		expect( result ).toEqual( expect.objectContaining( { outcome: 'no-changes' } ) );
		expect( withCheckpoint ).not.toHaveBeenCalled();
	} );

	// Decided before the menus are looked at: a satisfied edit inside one has nothing to undo either.
	it( 'reports no changes for a satisfied update inside a menu, capturing nothing', async () => {
		vi.mocked( areUpdateEditsAlreadySatisfied ).mockReturnValue( true );
		vi.mocked( getEditedMenuIds ).mockReturnValue( [ 19 ] );

		const { result } = await applyBlockEditsCallback( input );

		expect( result ).toEqual( expect.objectContaining( { outcome: 'no-changes' } ) );
		expect( withCheckpoint ).not.toHaveBeenCalled();
	} );

	it( 'fails when the edits changed nothing, without an undo', async () => {
		vi.mocked( haveBlocksChanged ).mockReturnValue( false );

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
		vi.mocked( getEditedMenuIds ).mockReturnValue( [ 19 ] );
		vi.mocked( getMenuIdAround ).mockImplementation( ( clientId: string ) =>
			clientId === 'link' ? 19 : undefined
		);
		vi.mocked( getChangeType ).mockReturnValue( 'text-content' );
		vi.mocked( haveBlocksChanged ).mockReturnValue( false );

		const { result } = await applyBlockEditsCallback( input );

		// Its checkpoint holds the menu too, which the inline swap cannot take back.
		expect( result.changeType ).toBe( 'other' );
		expect( sealCheckpointForSwap ).not.toHaveBeenCalled();

		expect( withCheckpoint ).toHaveBeenCalledWith(
			expect.objectContaining( { keys: [ 'blocks', 'navigation' ] } ),
			expect.any( Function )
		);

		// Not captured up front: a batch that fails before the menu keeps no undo for it.
		const { beforeWrite } = vi.mocked( applyEdits ).mock.calls[ 0 ][ 1 ];

		expect( recorder.captureMenu ).not.toHaveBeenCalled();

		await beforeWrite( 'para' );
		await beforeWrite( 'link' );

		expect( recorder.captureMenu.mock.calls ).toEqual( [ [ 19 ] ] );
		expect( recorder.markWritten ).not.toHaveBeenCalled();
		expect( result ).toEqual( expect.objectContaining( { outcome: 'updated' } ) );
	} );

	// The snapshot is taken just before the write; a write that then fails leaves nothing to undo.
	it( 'discards a menu captured for a batch that wrote nothing', async () => {
		vi.mocked( getEditedMenuIds ).mockReturnValue( [ 19 ] );
		vi.mocked( getMenuIdAround ).mockReturnValue( 19 );
		recorder.captureMenu.mockResolvedValue( true );
		level.hasWritten.mockReturnValue( false );
		vi.mocked( applyEdits ).mockImplementation( async ( _, { beforeWrite } ) => {
			await beforeWrite( 'link' );
			throw new Error( 'Stopped' );
		} );

		await applyBlockEditsCallback( input );

		expect( recorder.discardMenu ).toHaveBeenCalledWith( 19 );
	} );

	// The user may be scrolled anywhere; the capture frames what the call added.
	it( 'frames the capture on the inserted blocks too', async () => {
		vi.mocked( applyEdits ).mockResolvedValue( {
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
		vi.mocked( applyEdits ).mockRejectedValue( new Error( 'Parent block not found' ) );

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
		vi.mocked( normalizeEdits ).mockImplementation( () => {
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
		vi.mocked( getBlockingMove ).mockReturnValue( { from: 'Home', to: 'About' } );
		vi.mocked( applyEdits ).mockRejectedValue( new Error( 'Stopped' ) );
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
		vi.mocked( isEditorPage ).mockReturnValue( false );

		const { result } = await applyBlockEditsCallback( input );

		expect( result ).toEqual( expect.objectContaining( { success: false } ) );
		expect( withCheckpoint ).not.toHaveBeenCalled();
		expect( recordBigSkyTracksEvent ).not.toHaveBeenCalled();
	} );

	describe( 'a comparison against reference blocks', () => {
		const band = ( metadata?: Record< string, unknown > ) => ( {
			type: 'file' as const,
			file: { name: 'canvas.webp', mimeType: 'image/webp', bytes: 'AAAA' },
			...( metadata && { metadata } ),
		} );

		// `getUnframedClientIds` is real here, and it asks the canvas whether a
		// block has a box. With no canvas every reference is unframed, which is
		// the warning case; these tests mount one so the other branch is real too.
		let unmountCanvas: () => void = () => undefined;

		const mountCanvasWith = ( clientIds: string[] ) => {
			const frame = document.createElement( 'iframe' );
			frame.name = 'editor-canvas';
			document.body.append( frame );

			const canvasDocument = frame.contentDocument as Document;

			clientIds.forEach( ( clientId ) => {
				const element = canvasDocument.createElement( 'div' );
				element.setAttribute( 'data-block', clientId );
				element.getBoundingClientRect = () => ( { width: 900, height: 100 } ) as DOMRect;
				canvasDocument.body.append( element );
			} );

			unmountCanvas = () => frame.remove();
		};

		afterEach( () => {
			unmountCanvas();
			unmountCanvas = () => undefined;
		} );

		it( 'frames the reference blocks as well as the changed ones', async () => {
			await applyBlockEditsCallback( { ...input, visualCheckClientIds: [ 'ref1', 7, 'ref1' ] } );

			// Both sides of the comparison, deduplicated. The rasterizer frames
			// the union of every id it is given, so this is what puts the
			// reference in a picture at all.
			expect( captureCanvas ).toHaveBeenCalledWith( {
				clientIds: [ 'resolved-a1', 'resolved-ref1' ],
				fullPage: false,
			} );
		} );

		it( 'does not count a changed block as a reference', async () => {
			// Naming the block being edited would have the message claim a
			// comparison against the very thing that moved.
			vi.mocked( captureCanvas ).mockResolvedValue( [ band() ] );

			const result = await applyBlockEditsCallback( {
				...input,
				visualCheckClientIds: [ 'a1' ],
			} );

			expect( captureCanvas ).toHaveBeenCalledWith( {
				clientIds: [ 'resolved-a1' ],
				fullPage: false,
			} );
			expect( result.result.captureNotes ).toBeUndefined();
		} );

		it( 'tells the model the reference is in the picture', async () => {
			mountCanvasWith( [ 'resolved-ref1' ] );
			vi.mocked( captureCanvas ).mockResolvedValue( [ band() ] );

			const result = await applyBlockEditsCallback( {
				...input,
				visualCheckClientIds: [ 'ref1' ],
			} );

			expect( result.result.captureNotes ).toEqual( [
				expect.stringContaining( '1 block(s) named for comparison' ),
			] );
		} );

		it( 'says when the two sides came back as separate pictures', async () => {
			// The point of the change: distant sections get a full-size picture
			// each instead of one scaled-down page.
			mountCanvasWith( [ 'resolved-ref1' ] );
			vi.mocked( captureCanvas ).mockResolvedValue( [
				band( { regionIndex: 1, regionCount: 2 } ),
				band( { regionIndex: 2, regionCount: 2 } ),
			] );

			const result = await applyBlockEditsCallback( {
				...input,
				visualCheckClientIds: [ 'ref1' ],
			} );

			expect( result.result.captureNotes ).toEqual( [
				expect.stringContaining( '2 pictures' ),
				expect.stringContaining( 'named for comparison' ),
			] );
		} );

		it( 'warns when the pair was too spread out for bands', async () => {
			// Past the cap the rasterizer falls back to the whole page, and the
			// model has to know it is reading a scaled-down sheet.
			mountCanvasWith( [ 'resolved-ref1' ] );
			vi.mocked( captureCanvas ).mockResolvedValue( [ band( { fullPage: true } ) ] );

			const result = await applyBlockEditsCallback( {
				...input,
				visualCheckClientIds: [ 'ref1' ],
			} );

			expect( result.result.captureNotes ).toEqual( [
				expect.stringContaining( 'not be legible' ),
				expect.stringContaining( 'named for comparison' ),
			] );
		} );

		it( 'refuses to imply a comparison it cannot show', async () => {
			// The failure this exists for: the reference does not resolve on the
			// canvas, the capture quietly frames the changed side alone, and it
			// looks exactly like a picture that contains both.
			vi.mocked( captureCanvas ).mockResolvedValue( [ band() ] );

			const result = await applyBlockEditsCallback( {
				...input,
				visualCheckClientIds: [ 'ref1' ],
			} );

			expect( result.result.captureNotes ).toEqual( [
				expect.stringContaining( 'does not contain the blocks named for comparison' ),
			] );
			expect( result.result.captureNotes?.[ 0 ] ).toContain( 'cannot confirm a match' );
		} );

		it( 'adds no notes when no reference was named', async () => {
			vi.mocked( captureCanvas ).mockResolvedValue( [ band() ] );

			const result = await applyBlockEditsCallback( input );

			expect( result.result.captureNotes ).toBeUndefined();
		} );

		it( 'keeps the notes out of the message', async () => {
			// The user may see the message as the reply, so it is the summary alone.
			vi.mocked( captureCanvas ).mockResolvedValue( [ band( { fullPage: true } ) ] );

			const result = await applyBlockEditsCallback( {
				...input,
				visualCheckClientIds: [ 'ref1' ],
			} );

			expect( result.result.message ).toBe( 'Done.' );
			expect( result.result.captureNotes ).toHaveLength( 2 );
		} );

		it( 'adds the measured layout of the edited blocks', async () => {
			vi.mocked( captureCanvas ).mockResolvedValue( [ band() ] );
			vi.mocked( describeMeasuredLayout ).mockReturnValue( [ 'Row in group (abcd): …' ] );

			const result = await applyBlockEditsCallback( input );

			expect( describeMeasuredLayout ).toHaveBeenCalledWith( [ 'resolved-a1' ] );
			expect( result.result.captureNotes ).toEqual( [ 'Row in group (abcd): …' ] );
		} );

		it( 'puts the text contrast between the reference note and the measured layout', async () => {
			mountCanvasWith( [ 'resolved-ref1' ] );
			vi.mocked( captureCanvas ).mockResolvedValue( [ band() ] );
			vi.mocked( describeTextContrast ).mockReturnValue( {
				notes: [ 'Text contrast too low: …' ],
				failures: 1,
				backdrops: [],
			} );
			vi.mocked( describeMeasuredLayout ).mockReturnValue( [ 'Row in group (abcd): …' ] );

			const result = await applyBlockEditsCallback( {
				...input,
				visualCheckClientIds: [ 'ref1' ],
			} );

			expect( describeTextContrast ).toHaveBeenCalledWith( [ 'resolved-a1' ], {
				wholePage: false,
			} );
			expect( result.result.captureNotes ).toEqual( [
				expect.stringContaining( 'named for comparison' ),
				'Text contrast too low: …',
				'Row in group (abcd): …',
			] );
		} );

		it( 'reports the contrast failure count beside the notes', async () => {
			vi.mocked( captureCanvas ).mockResolvedValue( [ band() ] );
			vi.mocked( describeTextContrast ).mockReturnValue( {
				notes: [ 'Text contrast too low: …' ],
				failures: 2,
				backdrops: [],
			} );

			const result = await applyBlockEditsCallback( input );

			expect( result.result.contrastFailures ).toBe( 2 );
		} );

		it( 'reports a count of zero when the edited text measured readable', async () => {
			vi.mocked( captureCanvas ).mockResolvedValue( [ band() ] );
			vi.mocked( describeTextContrast ).mockReturnValue( {
				notes: [ 'Text contrast: all 1 …' ],
				failures: 0,
				backdrops: [],
			} );

			const result = await applyBlockEditsCallback( input );

			expect( result.result.contrastFailures ).toBe( 0 );
		} );

		it( 'sends the backdrops to fix beside the count', async () => {
			const backdrops = [
				{ clientId: 'c25n', name: 'core/group', ownBackground: false, textClientIds: [ 'ueo8' ] },
			];

			vi.mocked( captureCanvas ).mockResolvedValue( [ band() ] );
			vi.mocked( describeTextContrast ).mockReturnValue( {
				notes: [ 'Text contrast too low: …' ],
				failures: 1,
				backdrops,
			} );

			const result = await applyBlockEditsCallback( input );

			expect( result.result.contrastBackdrops ).toEqual( backdrops );
		} );

		it( 'leaves the backdrops out when there are none to fix', async () => {
			vi.mocked( captureCanvas ).mockResolvedValue( [ band() ] );
			vi.mocked( describeTextContrast ).mockReturnValue( {
				notes: [ 'Text contrast: all 1 …' ],
				failures: 0,
				backdrops: [],
			} );

			const result = await applyBlockEditsCallback( input );

			expect( result.result.contrastFailures ).toBe( 0 );
			expect( result.result ).not.toHaveProperty( 'contrastBackdrops' );
		} );

		it( 'leaves the count out when there was no text to measure', async () => {
			vi.mocked( captureCanvas ).mockResolvedValue( [ band() ] );

			const result = await applyBlockEditsCallback( input );

			expect( result.result ).not.toHaveProperty( 'contrastFailures' );
		} );

		it( 'leaves the count out, keeping the note, when no text could be measured', async () => {
			vi.mocked( captureCanvas ).mockResolvedValue( [ band() ] );
			vi.mocked( describeTextContrast ).mockReturnValue( {
				notes: [ 'Contrast could not be measured …' ],
				failures: null,
				backdrops: [],
			} );

			const result = await applyBlockEditsCallback( input );

			expect( result.result ).not.toHaveProperty( 'contrastFailures' );
			expect( result.result.captureNotes ).toEqual( [ 'Contrast could not be measured …' ] );
		} );

		describe( 'with custom CSS', () => {
			const headerBlock = { ...paragraph( 'Header' ), clientId: 'h1' };

			beforeEach( () => {
				vi.mocked( captureCanvas ).mockResolvedValue( [ band( { fullPage: true } ) ] );
				vi.mocked( getPageBlocks ).mockReturnValue( {
					blocks: [ paragraph( 'Old' ) ],
					templateParts: [ { slug: 'header', blocks: [ headerBlock ] } ],
				} );
				vi.mocked( describeTextContrast ).mockReturnValue( {
					notes: [ 'Text contrast too low: …' ],
					failures: 1,
					backdrops: [],
				} );
			} );

			it( 'measures the whole page when only the CSS changed, with no edited block', async () => {
				// The case a CSS-only edit hit: no updates or inserts, so no
				// edited block to measure, though the CSS can recolour any of them.
				vi.mocked( normalizeEdits ).mockReturnValue( edits( { updates: [], customCSS: 'p{}' } ) );
				vi.mocked( getEditedClientIds ).mockReturnValue( [] );

				const result = await applyBlockEditsCallback( { customCSS: 'p{}', toolCallId: 'call-1' } );

				expect( describeTextContrast ).toHaveBeenCalledWith( [ 'p1', 'h1' ], {
					wholePage: true,
				} );
				expect( result.result.contrastFailures ).toBe( 1 );
				expect( result.result.captureNotes ).toContain( 'Text contrast too low: …' );
			} );

			it( 'captures and measures the whole page for block edits with CSS, the edited blocks first', async () => {
				// The picture has to show what the notes leave to it.
				vi.mocked( normalizeEdits ).mockReturnValue( edits( { customCSS: 'p{}' } ) );

				await applyBlockEditsCallback( { ...input, customCSS: 'p{}' } );

				expect( captureCanvas ).toHaveBeenCalledWith(
					expect.objectContaining( { fullPage: true } )
				);

				expect( describeTextContrast ).toHaveBeenCalledWith( [ 'resolved-a1', 'p1', 'h1' ], {
					wholePage: true,
				} );
			} );
		} );

		it( 'measures only the edited blocks when no CSS changed', async () => {
			vi.mocked( captureCanvas ).mockResolvedValue( [ band() ] );

			await applyBlockEditsCallback( input );

			expect( describeTextContrast ).toHaveBeenCalledWith( [ 'resolved-a1' ], {
				wholePage: false,
			} );
		} );

		it( 'measures nothing without a capture', async () => {
			const result = await applyBlockEditsCallback( input );

			expect( describeMeasuredLayout ).not.toHaveBeenCalled();
			expect( describeTextContrast ).not.toHaveBeenCalled();
			expect( result.result.captureNotes ).toBeUndefined();
		} );

		describe( 'whether anything moved', () => {
			const snapshot = { boxes: new Map(), labels: [ 'group (ndP2)' ] };
			const unmoved = 'No edited block moved: group (ndP2) and its children are where they were.';

			beforeEach( () => {
				vi.mocked( captureCanvas ).mockResolvedValue( [ band() ] );
				vi.mocked( snapshotLayout ).mockReturnValue( snapshot );
				vi.mocked( describeUnmoved ).mockReturnValue( unmoved );
			} );

			it( 'reads the edited blocks before the writes and compares after them', async () => {
				vi.mocked( applyEdits ).mockImplementation( async () => {
					expect( snapshotLayout ).toHaveBeenCalledWith( [ 'resolved-a1' ] );
					expect( describeUnmoved ).not.toHaveBeenCalled();

					return { recoveredTargetIds: new Set(), insertedClientIds: [] };
				} );

				const result = await applyBlockEditsCallback( input );

				expect( describeUnmoved ).toHaveBeenCalledWith( snapshot );
				expect( result.result.captureNotes ).toEqual( [ unmoved ] );
			} );

			it( 'does not compare an edit that inserts or deletes', async () => {
				vi.mocked( normalizeEdits ).mockReturnValue( edits( { deletes: [ 'b1' ] } ) );

				await applyBlockEditsCallback( input );

				expect( snapshotLayout ).not.toHaveBeenCalled();
				expect( describeUnmoved ).not.toHaveBeenCalled();
			} );

			it( 'does not compare an edit that changed nothing', async () => {
				vi.mocked( areUpdateEditsAlreadySatisfied ).mockReturnValue( true );

				const result = await applyBlockEditsCallback( input );

				expect( describeUnmoved ).not.toHaveBeenCalled();
				expect( result.result.captureNotes ).toBeUndefined();
			} );
		} );
	} );

	// The flag ships only with an image: the chat withholds the summary on its
	// strength, and with nothing to look at the server's reply never comes.
	it.each( [
		[ 'with a capture', [ { type: 'file', file: { name: 'canvas.webp' } } ], true ],
		[ 'without one', null, undefined ],
	] )( 'forwards visualCheckPending %s', async ( _, parts, forwarded ) => {
		vi.mocked( captureCanvas ).mockResolvedValue( parts as never );

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
