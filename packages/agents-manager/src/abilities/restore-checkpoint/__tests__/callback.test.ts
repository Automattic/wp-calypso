import {
	RESTORE_CHECKPOINT_TOOL_ID,
	clearCheckpoint,
	getCheckpoint,
	getCheckpoints,
	hasCheckpoint,
	restoreCheckpoint,
	setReciprocalCheckpoint,
} from '../../../utils/checkpoints';
import { isEditorPage } from '../../../utils/is-editor-page';
import {
	getProviderCheckpoint,
	getProviderCheckpointRecords,
	getProviderCheckpoints,
} from '../../../utils/provider-checkpoints';
import { getToolCallIdFromConversationHistory } from '../../../utils/tool-call-history';
import { recordBigSkyTracksEvent } from '../../../utils/tracks';
import { restoreCheckpointCallback } from '../callback';

jest.mock( '../../../utils/checkpoints', () => ( {
	RESTORE_CHECKPOINT_TOOL_ID: 'big_sky__restore_checkpoint',
	clearCheckpoint: jest.fn(),
	getCheckpoint: jest.fn(),
	getCheckpoints: jest.fn( () => [] ),
	hasCheckpoint: jest.fn(),
	restoreCheckpoint: jest.fn(),
	setReciprocalCheckpoint: jest.fn(),
} ) );
jest.mock( '../../../utils/is-editor-page', () => ( { isEditorPage: jest.fn( () => true ) } ) );
jest.mock( '../../../utils/provider-checkpoints', () => ( {
	getProviderCheckpoint: jest.fn( () => null ),
	getProviderCheckpointRecords: jest.fn( () => [] ),
	getProviderCheckpoints: jest.fn(),
} ) );
jest.mock( '../../../utils/tracks', () => ( { recordBigSkyTracksEvent: jest.fn() } ) );
jest.mock( '../../../utils/tool-call-history', () => ( {
	getToolCallIdFromConversationHistory: jest.fn( () => null ),
} ) );

const mockGetCheckpoint = getCheckpoint as jest.Mock;
const mockGetCheckpoints = getCheckpoints as jest.Mock;
const mockHasCheckpoint = hasCheckpoint as jest.Mock;
const mockGetToolCallId = getToolCallIdFromConversationHistory as jest.Mock;
const mockGetProviderCheckpoints = getProviderCheckpoints as jest.Mock;
const mockGetProviderCheckpoint = getProviderCheckpoint as jest.Mock;
const mockGetProviderCheckpointRecords = getProviderCheckpointRecords as jest.Mock;

const RESTORE_CALL_ID = 'toolu_restore';
const RESTORE_SUMMARY = 'I undid the color change.';

const TARGET_CHECKPOINT = {
	id: 'toolu_target',
	toolId: 'big_sky__show_component',
	checkpointKeys: [ 'color' ],
};

const makeProviderCheckpoints = () => ( {
	hasCheckpoint: jest.fn( ( id: string ) => id === TARGET_CHECKPOINT.id ),
	restoreCheckpoint: jest.fn( () => Promise.resolve() ),
	setCheckpoint: jest.fn(),
	clearCheckpoint: jest.fn(),
	addNavigationToCheckpoint: jest.fn(),
} );

const makeInput = ( overrides = {} ) => ( {
	checkpointId: TARGET_CHECKPOINT.id,
	summary: RESTORE_SUMMARY,
	requestIntentType: 'undo' as const,
	...overrides,
} );

// The callback logs a failed restore; the spy keeps the run quiet and pins the message.
let consoleError: jest.SpyInstance;

beforeEach( () => {
	jest.clearAllMocks();
	consoleError = jest.spyOn( console, 'error' ).mockImplementation( () => {} );
	( isEditorPage as jest.Mock ).mockReturnValue( true );
	mockHasCheckpoint.mockReturnValue( false );
	mockGetCheckpoint.mockImplementation( ( id: string ) =>
		id === TARGET_CHECKPOINT.id ? TARGET_CHECKPOINT : undefined
	);
	mockGetCheckpoints.mockReturnValue( [ TARGET_CHECKPOINT ] );
	mockGetToolCallId.mockReturnValue( null );
	mockGetProviderCheckpoints.mockReturnValue( undefined );
	mockGetProviderCheckpoint.mockReturnValue( null );
	mockGetProviderCheckpointRecords.mockReturnValue( [] );
} );

afterEach( () => consoleError.mockRestore() );

describe( 'restoreCheckpointCallback', () => {
	it( 'refuses outside the editor', async () => {
		( isEditorPage as jest.Mock ).mockReturnValue( false );

		const result = await restoreCheckpointCallback( makeInput() );

		expect( result.result ).toMatchObject( { success: false, error: 'Not an editor page.' } );
		expect( restoreCheckpoint ).not.toHaveBeenCalled();
	} );

	it( 'reports a missing checkpoint id', async () => {
		const result = await restoreCheckpointCallback( makeInput( { checkpointId: '' } ) );

		expect( result ).toEqual( {
			result: {
				success: false,
				message: 'I could not restore the checkpoint because no checkpoint ID was provided.',
				error: 'Missing checkpointId.',
			},
			returnToAgent: true,
		} );
	} );

	it( 'reports an unknown checkpoint id', async () => {
		const result = await restoreCheckpointCallback( makeInput( { checkpointId: 'toolu_gone' } ) );

		expect( result.result ).toMatchObject( {
			success: false,
			error: 'Checkpoint not found: toolu_gone',
			details: { checkpointId: 'toolu_gone' },
		} );
	} );

	it( 'refuses an input that is not an object, recording the attempt', async () => {
		const result = await restoreCheckpointCallback( null );

		expect( result.result.success ).toBe( false );
		expect( recordBigSkyTracksEvent ).toHaveBeenCalledWith(
			'jetpack_big_sky_restore_checkpoint_action',
			{ action: 'restore', id: '', outcome: 'failed', source: 'chat' }
		);
	} );

	// The chat's Undo button records the same event; `source` tells the two apart,
	// and the id is the tool call the checkpoint is keyed by.
	it.each( [
		{ case: 'a restore that landed', input: makeInput(), action: 'undo', outcome: 'success' },
		{
			case: 'one refused for an unknown id',
			input: makeInput( { checkpointId: 'toolu_gone', requestIntentType: 'redo' } ),
			action: 'redo',
			outcome: 'failed',
		},
		{
			case: 'one with no usable intent, as a plain restore',
			input: makeInput( { requestIntentType: 'rewind' } ),
			action: 'restore',
			outcome: 'success',
		},
	] )( 'records $case, once', async ( { input, action, outcome } ) => {
		await restoreCheckpointCallback( input as never );

		expect( recordBigSkyTracksEvent ).toHaveBeenCalledTimes( 1 );
		expect( recordBigSkyTracksEvent ).toHaveBeenCalledWith(
			'jetpack_big_sky_restore_checkpoint_action',
			{ action, id: input.checkpointId, outcome, source: 'chat' }
		);
	} );

	it( 'restores the checkpoint and confirms with the given summary', async () => {
		const result = await restoreCheckpointCallback( makeInput() );

		expect( restoreCheckpoint ).toHaveBeenCalledWith( TARGET_CHECKPOINT.id );
		expect( result ).toEqual( {
			result: {
				success: true,
				message: RESTORE_SUMMARY,
				details: { checkpointId: TARGET_CHECKPOINT.id },
			},
			returnToAgent: true,
		} );
	} );

	it.each( [
		[ 'undo', 'redo' ],
		[ 'redo', 'undo' ],
		[ 'restore', 'restore' ],
		[ undefined, 'restore' ],
	] as const )(
		'records a reciprocal checkpoint with the %s intent flipped to %s',
		async ( requestIntentType, reciprocal ) => {
			mockGetToolCallId.mockReturnValue( RESTORE_CALL_ID );

			await restoreCheckpointCallback( makeInput( { requestIntentType } ) );

			expect( setReciprocalCheckpoint ).toHaveBeenCalledWith( RESTORE_CALL_ID, TARGET_CHECKPOINT, {
				toolId: 'big_sky__restore_checkpoint',
				summary: RESTORE_SUMMARY,
				restoresCheckpointId: TARGET_CHECKPOINT.id,
				restoredCheckpointToolId: TARGET_CHECKPOINT.toolId,
				requestIntentType: reciprocal,
				createdByRequestIntentType: requestIntentType ?? 'restore',
			} );
		}
	);

	// A reciprocal that cannot be recorded means the same page or menu would
	// fail the restore part-way, leaving the site half-restored with no redo.
	it( 'refuses the restore when the reciprocal cannot be recorded', async () => {
		mockGetToolCallId.mockReturnValue( RESTORE_CALL_ID );
		( setReciprocalCheckpoint as jest.Mock ).mockRejectedValueOnce(
			new Error( 'Navigation menu not found: 9' )
		);

		const result = await restoreCheckpointCallback( makeInput() );

		expect( result.result.success ).toBe( false );
		expect( result.result.error ).toContain( 'Navigation menu not found: 9' );
		expect( restoreCheckpoint ).not.toHaveBeenCalled();
	} );

	it( 'keeps an existing checkpoint under the restore call id', async () => {
		mockGetToolCallId.mockReturnValue( RESTORE_CALL_ID );
		mockHasCheckpoint.mockReturnValue( true );

		await restoreCheckpointCallback( makeInput() );

		expect( setReciprocalCheckpoint ).not.toHaveBeenCalled();
	} );

	it( 'skips the reciprocal checkpoint when the call id is unknown', async () => {
		await restoreCheckpointCallback( makeInput() );

		expect( setReciprocalCheckpoint ).not.toHaveBeenCalled();
	} );

	it( 'clears stale restore reciprocals after a successful restore', async () => {
		mockGetToolCallId.mockReturnValue( RESTORE_CALL_ID );
		mockGetCheckpoints.mockReturnValue( [
			TARGET_CHECKPOINT,
			{
				id: 'toolu_old_redo',
				toolId: RESTORE_CHECKPOINT_TOOL_ID,
				checkpointKeys: [],
				requestIntentType: 'redo',
			},
			{ id: 'toolu_legacy', toolId: RESTORE_CHECKPOINT_TOOL_ID, checkpointKeys: [] },
			{
				id: 'toolu_other_intent',
				toolId: RESTORE_CHECKPOINT_TOOL_ID,
				checkpointKeys: [],
				requestIntentType: 'undo',
			},
			{ id: RESTORE_CALL_ID, toolId: RESTORE_CHECKPOINT_TOOL_ID, checkpointKeys: [] },
		] );

		await restoreCheckpointCallback( makeInput() );

		expect( ( clearCheckpoint as jest.Mock ).mock.calls.flat() ).toEqual( [
			'toolu_old_redo',
			'toolu_legacy',
		] );
	} );

	it( 'clears stale reciprocals from the provider store after an AM restore', async () => {
		mockGetToolCallId.mockReturnValue( RESTORE_CALL_ID );
		const providerCheckpoints = makeProviderCheckpoints();
		mockGetProviderCheckpoints.mockReturnValue( providerCheckpoints );
		mockGetProviderCheckpointRecords.mockReturnValue( [
			{
				id: 'toolu_provider_stale',
				toolId: RESTORE_CHECKPOINT_TOOL_ID,
				requestIntentType: 'redo',
			},
			{ id: 'toolu_provider_edit', toolId: 'big_sky__edit_entity_record' },
		] );

		await restoreCheckpointCallback( makeInput() );

		expect( providerCheckpoints.clearCheckpoint.mock.calls.flat() ).toEqual( [
			'toolu_provider_stale',
		] );
	} );

	it( 'clears stale reciprocals from both stores after a delegated restore', async () => {
		mockGetCheckpoint.mockReturnValue( undefined );
		mockGetToolCallId.mockReturnValue( RESTORE_CALL_ID );
		const providerCheckpoints = makeProviderCheckpoints();
		mockGetProviderCheckpoints.mockReturnValue( providerCheckpoints );
		mockGetCheckpoints.mockReturnValue( [
			{ id: 'toolu_am_stale', toolId: RESTORE_CHECKPOINT_TOOL_ID, requestIntentType: 'redo' },
		] );
		mockGetProviderCheckpointRecords.mockReturnValue( [
			{
				id: 'toolu_provider_stale',
				toolId: RESTORE_CHECKPOINT_TOOL_ID,
				requestIntentType: 'redo',
			},
		] );

		await restoreCheckpointCallback( makeInput() );

		expect( ( clearCheckpoint as jest.Mock ).mock.calls.flat() ).toEqual( [ 'toolu_am_stale' ] );
		expect( providerCheckpoints.clearCheckpoint.mock.calls.flat() ).toEqual( [
			'toolu_provider_stale',
		] );
	} );

	it( 'restores even when recording the provider reciprocal fails', async () => {
		mockGetCheckpoint.mockReturnValue( undefined );
		mockGetToolCallId.mockReturnValue( RESTORE_CALL_ID );
		mockGetProviderCheckpoint.mockReturnValue( { checkpointKeys: [ 'site_title' ] } );
		const providerCheckpoints = makeProviderCheckpoints();
		providerCheckpoints.setCheckpoint.mockImplementationOnce( () => {
			throw new Error( 'Snapshot exploded.' );
		} );
		mockGetProviderCheckpoints.mockReturnValue( providerCheckpoints );

		const result = await restoreCheckpointCallback( makeInput() );

		expect( providerCheckpoints.restoreCheckpoint ).toHaveBeenCalledWith( TARGET_CHECKPOINT.id );
		expect( providerCheckpoints.clearCheckpoint ).toHaveBeenCalledWith( RESTORE_CALL_ID );
		expect( result.result.success ).toBe( true );
		expect( consoleError ).toHaveBeenCalledWith(
			`[AgentsManager] Failed to record a redo checkpoint for ${ TARGET_CHECKPOINT.id }:`,
			expect.any( Error )
		);
	} );

	it( 'delegates to the provider store when AM does not hold the id', async () => {
		mockGetCheckpoint.mockReturnValue( undefined );
		const providerCheckpoints = makeProviderCheckpoints();
		mockGetProviderCheckpoints.mockReturnValue( providerCheckpoints );

		const result = await restoreCheckpointCallback( makeInput() );

		expect( providerCheckpoints.restoreCheckpoint ).toHaveBeenCalledWith( TARGET_CHECKPOINT.id );
		expect( restoreCheckpoint ).not.toHaveBeenCalled();
		expect( result ).toEqual( {
			result: {
				success: true,
				message: RESTORE_SUMMARY,
				details: { checkpointId: TARGET_CHECKPOINT.id },
			},
			returnToAgent: true,
		} );
	} );

	it( 'records the reciprocal in the provider store scoped to the target keys', async () => {
		mockGetCheckpoint.mockReturnValue( undefined );
		mockGetToolCallId.mockReturnValue( RESTORE_CALL_ID );
		mockGetProviderCheckpoint.mockReturnValue( {
			checkpointKeys: [ 'site_title', 'site_metadata' ],
		} );
		const providerCheckpoints = makeProviderCheckpoints();
		mockGetProviderCheckpoints.mockReturnValue( providerCheckpoints );

		await restoreCheckpointCallback( makeInput() );

		expect( mockGetProviderCheckpoint ).toHaveBeenCalledWith( TARGET_CHECKPOINT.id );
		expect( providerCheckpoints.setCheckpoint ).toHaveBeenCalledWith(
			RESTORE_CALL_ID,
			[ 'site_title', 'site_metadata' ],
			{
				toolCallId: RESTORE_CALL_ID,
				toolId: 'big_sky__restore_checkpoint',
				summary: RESTORE_SUMMARY,
				restoresCheckpointId: TARGET_CHECKPOINT.id,
				requestIntentType: 'redo',
				createdByRequestIntentType: 'undo',
			}
		);
		expect( setReciprocalCheckpoint ).not.toHaveBeenCalled();
	} );

	it( 'copies the page-rename flip and navigation snapshots into the reciprocal', async () => {
		mockGetCheckpoint.mockReturnValue( undefined );
		mockGetToolCallId.mockReturnValue( RESTORE_CALL_ID );
		mockGetProviderCheckpoint.mockReturnValue( {
			checkpointKeys: [ 'page', 'navigation' ],
			pageRename: { pageId: 12, oldTitle: 'About', newTitle: 'Our Story' },
			navigationRecords: { 'nav-1': {}, 'nav-2': {} },
		} );
		const providerCheckpoints = makeProviderCheckpoints();
		mockGetProviderCheckpoints.mockReturnValue( providerCheckpoints );

		await restoreCheckpointCallback( makeInput() );

		expect( providerCheckpoints.setCheckpoint ).toHaveBeenCalledWith(
			RESTORE_CALL_ID,
			[ 'page', 'navigation' ],
			expect.objectContaining( {
				pageRename: { pageId: 12, oldTitle: 'Our Story', newTitle: 'About' },
			} )
		);
		expect( providerCheckpoints.addNavigationToCheckpoint.mock.calls ).toEqual( [
			[ RESTORE_CALL_ID, 'nav-1' ],
			[ RESTORE_CALL_ID, 'nav-2' ],
		] );
		expect(
			providerCheckpoints.addNavigationToCheckpoint.mock.invocationCallOrder[ 0 ]
		).toBeLessThan( providerCheckpoints.restoreCheckpoint.mock.invocationCallOrder[ 0 ] );
	} );

	it( 'skips the reciprocal when the target keys are unreadable', async () => {
		mockGetCheckpoint.mockReturnValue( undefined );
		mockGetToolCallId.mockReturnValue( RESTORE_CALL_ID );
		const providerCheckpoints = makeProviderCheckpoints();
		mockGetProviderCheckpoints.mockReturnValue( providerCheckpoints );

		const result = await restoreCheckpointCallback( makeInput() );

		expect( providerCheckpoints.setCheckpoint ).not.toHaveBeenCalled();
		expect( providerCheckpoints.restoreCheckpoint ).toHaveBeenCalledWith( TARGET_CHECKPOINT.id );
		expect( result.result.success ).toBe( true );
	} );

	it( 'drops the provider reciprocal when a delegated restore fails', async () => {
		mockGetCheckpoint.mockReturnValue( undefined );
		mockGetToolCallId.mockReturnValue( RESTORE_CALL_ID );
		mockGetProviderCheckpoint.mockReturnValue( { checkpointKeys: [ 'site_title' ] } );
		const providerCheckpoints = makeProviderCheckpoints();
		providerCheckpoints.restoreCheckpoint.mockRejectedValueOnce( new Error( 'Restore exploded.' ) );
		mockGetProviderCheckpoints.mockReturnValue( providerCheckpoints );

		const result = await restoreCheckpointCallback( makeInput() );

		expect( providerCheckpoints.clearCheckpoint ).toHaveBeenCalledWith( RESTORE_CALL_ID );
		expect( result.result ).toMatchObject( {
			success: false,
			error: expect.stringContaining( 'Restore exploded.' ),
		} );
	} );

	// Kept, not dropped: several domains persist as they restore, so a failure
	// part-way leaves the site changed and the reciprocal is the way back.
	it( 'reports a failed restore and keeps the reciprocal', async () => {
		mockGetToolCallId.mockReturnValue( RESTORE_CALL_ID );
		( restoreCheckpoint as jest.Mock ).mockRejectedValueOnce( new Error( 'Restore exploded.' ) );

		const result = await restoreCheckpointCallback( makeInput() );

		expect( result.result ).toMatchObject( {
			success: false,
			error: expect.stringContaining( 'Restore exploded.' ),
			details: { checkpointId: TARGET_CHECKPOINT.id },
		} );
		expect( clearCheckpoint ).not.toHaveBeenCalled();
		expect( consoleError ).toHaveBeenCalledWith(
			`[AgentsManager] Error restoring checkpoint ${ TARGET_CHECKPOINT.id }:`,
			expect.any( Error )
		);
	} );

	describe( 'a redo that names the undone change', () => {
		const UNDO_CHECKPOINT = {
			id: 'toolu_undo',
			toolId: RESTORE_CHECKPOINT_TOOL_ID,
			checkpointKeys: [ 'color' ],
			restoresCheckpointId: TARGET_CHECKPOINT.id,
			requestIntentType: 'redo' as const,
		};
		const REDO_CHECKPOINT = {
			...UNDO_CHECKPOINT,
			id: 'toolu_redo',
			requestIntentType: 'undo' as const,
		};

		beforeEach( () => mockGetToolCallId.mockReturnValue( RESTORE_CALL_ID ) );

		it.each( [
			{ case: 'an undo', requestIntentType: 'redo' as const },
			{ case: 'a plain restore', requestIntentType: 'restore' as const },
		] )(
			're-applies the change from the checkpoint $case left',
			async ( { requestIntentType } ) => {
				const undoCheckpoint = { ...UNDO_CHECKPOINT, requestIntentType };
				mockGetCheckpoints.mockReturnValue( [ TARGET_CHECKPOINT, undoCheckpoint ] );

				const result = await restoreCheckpointCallback(
					makeInput( { requestIntentType: 'redo' } )
				);

				expect( restoreCheckpoint ).toHaveBeenCalledWith( UNDO_CHECKPOINT.id );
				expect( setReciprocalCheckpoint ).toHaveBeenCalledWith(
					RESTORE_CALL_ID,
					undoCheckpoint,
					expect.objectContaining( {
						restoresCheckpointId: UNDO_CHECKPOINT.id,
						requestIntentType: 'undo',
					} )
				);
				expect( result.result.success ).toBe( true );
			}
		);

		it.each( [
			{
				case: 'an undo, which never turns into a redo',
				requestIntentType: 'undo' as const,
				checkpoints: [ TARGET_CHECKPOINT, UNDO_CHECKPOINT ],
			},
			{
				case: 'a redo once that checkpoint has been used',
				requestIntentType: 'redo' as const,
				checkpoints: [
					TARGET_CHECKPOINT,
					UNDO_CHECKPOINT,
					{ ...REDO_CHECKPOINT, restoresCheckpointId: UNDO_CHECKPOINT.id },
				],
			},
			{
				case: "a redo whose only checkpoint of that change is a redo's own",
				requestIntentType: 'redo' as const,
				checkpoints: [ TARGET_CHECKPOINT, REDO_CHECKPOINT ],
			},
		] )(
			'restores the named checkpoint for $case',
			async ( { requestIntentType, checkpoints } ) => {
				mockGetCheckpoints.mockReturnValue( checkpoints );

				await restoreCheckpointCallback( makeInput( { requestIntentType } ) );

				expect( restoreCheckpoint ).toHaveBeenCalledWith( TARGET_CHECKPOINT.id );
			}
		);
	} );
} );
