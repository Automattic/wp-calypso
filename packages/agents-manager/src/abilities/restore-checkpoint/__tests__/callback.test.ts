import {
	RESTORE_CHECKPOINT_TOOL_ID,
	clearCheckpoint,
	getCheckpoint,
	getCheckpoints,
	hasCheckpoint,
	restoreCheckpoint,
	setCheckpoint,
} from '../../../utils/checkpoints';
import { isEditorPage } from '../../../utils/is-editor-page';
import {
	getProviderCheckpointKeys,
	getProviderCheckpoints,
} from '../../../utils/provider-checkpoints';
import { getToolCallIdFromConversationHistory } from '../../../utils/tool-call-history';
import { restoreCheckpointCallback } from '../callback';

jest.mock( '../../../utils/checkpoints', () => ( {
	RESTORE_CHECKPOINT_TOOL_ID: 'big_sky__restore_checkpoint',
	clearCheckpoint: jest.fn(),
	getCheckpoint: jest.fn(),
	getCheckpoints: jest.fn( () => [] ),
	hasCheckpoint: jest.fn(),
	restoreCheckpoint: jest.fn(),
	setCheckpoint: jest.fn(),
} ) );
jest.mock( '../../../utils/is-editor-page', () => ( { isEditorPage: jest.fn( () => true ) } ) );
jest.mock( '../../../utils/provider-checkpoints', () => ( {
	getProviderCheckpointKeys: jest.fn( () => null ),
	getProviderCheckpoints: jest.fn(),
} ) );
jest.mock( '../../../utils/tool-call-history', () => ( {
	getToolCallIdFromConversationHistory: jest.fn( () => null ),
} ) );

const mockGetCheckpoint = getCheckpoint as jest.Mock;
const mockGetCheckpoints = getCheckpoints as jest.Mock;
const mockHasCheckpoint = hasCheckpoint as jest.Mock;
const mockGetToolCallId = getToolCallIdFromConversationHistory as jest.Mock;
const mockGetProviderCheckpoints = getProviderCheckpoints as jest.Mock;
const mockGetProviderCheckpointKeys = getProviderCheckpointKeys as jest.Mock;

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
} );

const makeInput = ( overrides = {} ) => ( {
	checkpointId: TARGET_CHECKPOINT.id,
	summary: RESTORE_SUMMARY,
	requestIntentType: 'undo' as const,
	...overrides,
} );

beforeEach( () => {
	jest.clearAllMocks();
	( isEditorPage as jest.Mock ).mockReturnValue( true );
	mockHasCheckpoint.mockReturnValue( false );
	mockGetCheckpoint.mockImplementation( ( id: string ) =>
		id === TARGET_CHECKPOINT.id ? TARGET_CHECKPOINT : undefined
	);
	mockGetCheckpoints.mockReturnValue( [ TARGET_CHECKPOINT ] );
	mockGetToolCallId.mockReturnValue( null );
	mockGetProviderCheckpoints.mockReturnValue( undefined );
	mockGetProviderCheckpointKeys.mockReturnValue( null );
} );

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

			expect( setCheckpoint ).toHaveBeenCalledWith(
				RESTORE_CALL_ID,
				TARGET_CHECKPOINT.checkpointKeys,
				{
					toolId: 'big_sky__restore_checkpoint',
					summary: RESTORE_SUMMARY,
					restoresCheckpointId: TARGET_CHECKPOINT.id,
					restoredCheckpointToolId: TARGET_CHECKPOINT.toolId,
					requestIntentType: reciprocal,
					createdByRequestIntentType: requestIntentType ?? 'restore',
				}
			);
		}
	);

	it( 'keeps an existing checkpoint under the restore call id', async () => {
		mockGetToolCallId.mockReturnValue( RESTORE_CALL_ID );
		mockHasCheckpoint.mockReturnValue( true );

		await restoreCheckpointCallback( makeInput() );

		expect( setCheckpoint ).not.toHaveBeenCalled();
	} );

	it( 'skips the reciprocal checkpoint when the call id is unknown', async () => {
		await restoreCheckpointCallback( makeInput() );

		expect( setCheckpoint ).not.toHaveBeenCalled();
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
		mockGetProviderCheckpointKeys.mockReturnValue( [ 'site_title', 'site_metadata' ] );
		const providerCheckpoints = makeProviderCheckpoints();
		mockGetProviderCheckpoints.mockReturnValue( providerCheckpoints );

		await restoreCheckpointCallback( makeInput() );

		expect( mockGetProviderCheckpointKeys ).toHaveBeenCalledWith( TARGET_CHECKPOINT.id );
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
		expect( setCheckpoint ).not.toHaveBeenCalled();
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
		mockGetProviderCheckpointKeys.mockReturnValue( [ 'site_title' ] );
		const providerCheckpoints = makeProviderCheckpoints();
		providerCheckpoints.restoreCheckpoint.mockRejectedValueOnce( new Error( 'Restore exploded.' ) );
		mockGetProviderCheckpoints.mockReturnValue( providerCheckpoints );

		const result = await restoreCheckpointCallback( makeInput() );

		expect( providerCheckpoints.clearCheckpoint ).toHaveBeenCalledWith( RESTORE_CALL_ID );
		expect( result.result ).toMatchObject( { success: false, error: 'Restore exploded.' } );
	} );

	it( 'reports a failed restore and drops the just-created reciprocal', async () => {
		mockGetToolCallId.mockReturnValue( RESTORE_CALL_ID );
		( restoreCheckpoint as jest.Mock ).mockRejectedValueOnce( new Error( 'Restore exploded.' ) );

		const result = await restoreCheckpointCallback( makeInput() );

		expect( result.result ).toMatchObject( {
			success: false,
			error: 'Restore exploded.',
			details: { checkpointId: TARGET_CHECKPOINT.id },
		} );
		expect( clearCheckpoint ).toHaveBeenCalledTimes( 1 );
		expect( clearCheckpoint ).toHaveBeenCalledWith( RESTORE_CALL_ID );
	} );

	it( 'keeps a pre-existing reciprocal when the restore fails', async () => {
		mockGetToolCallId.mockReturnValue( RESTORE_CALL_ID );
		mockHasCheckpoint.mockReturnValue( true );
		( restoreCheckpoint as jest.Mock ).mockRejectedValueOnce( new Error( 'Restore exploded.' ) );

		await restoreCheckpointCallback( makeInput() );

		expect( clearCheckpoint ).not.toHaveBeenCalled();
	} );
} );
