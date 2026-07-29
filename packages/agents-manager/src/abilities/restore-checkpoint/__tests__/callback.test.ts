import {
	clearCheckpoint,
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

const mockGetCheckpoints = getCheckpoints as jest.Mock;
const mockHasCheckpoint = hasCheckpoint as jest.Mock;
const mockGetToolCallId = getToolCallIdFromConversationHistory as jest.Mock;
const mockGetProviderCheckpoints = getProviderCheckpoints as jest.Mock;
const mockGetProviderCheckpointKeys = getProviderCheckpointKeys as jest.Mock;

const makeProviderCheckpoints = () => ( {
	hasCheckpoint: jest.fn( ( id: string ) => id === 'toolu_target' ),
	restoreCheckpoint: jest.fn( () => Promise.resolve() ),
	setCheckpoint: jest.fn(),
	clearCheckpoint: jest.fn(),
} );

const makeInput = ( overrides = {} ) => ( {
	checkpointId: 'toolu_target',
	summary: 'I undid the color change.',
	requestIntentType: 'undo' as const,
	...overrides,
} );

beforeEach( () => {
	jest.clearAllMocks();
	( isEditorPage as jest.Mock ).mockReturnValue( true );
	mockHasCheckpoint.mockImplementation( ( id: string ) => id === 'toolu_target' );
	mockGetCheckpoints.mockReturnValue( [
		{ id: 'toolu_target', toolId: 'big_sky__show_component', checkpointKeys: [ 'color' ] },
	] );
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

		expect( restoreCheckpoint ).toHaveBeenCalledWith( 'toolu_target' );
		expect( result ).toEqual( {
			result: {
				success: true,
				message: 'I undid the color change.',
				details: { checkpointId: 'toolu_target' },
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
			mockGetToolCallId.mockReturnValue( 'toolu_restore' );

			await restoreCheckpointCallback( makeInput( { requestIntentType } ) );

			expect( setCheckpoint ).toHaveBeenCalledWith( 'toolu_restore', [ 'color' ], {
				toolCallId: 'toolu_restore',
				toolId: 'big_sky__restore_checkpoint',
				summary: 'I undid the color change.',
				restoresCheckpointId: 'toolu_target',
				restoredCheckpointToolId: 'big_sky__show_component',
				requestIntentType: reciprocal,
				createdByRequestIntentType: requestIntentType ?? 'restore',
			} );
		}
	);

	it( 'keeps an existing checkpoint under the restore call id', async () => {
		mockGetToolCallId.mockReturnValue( 'toolu_restore' );
		mockHasCheckpoint.mockReturnValue( true );

		await restoreCheckpointCallback( makeInput() );

		expect( setCheckpoint ).not.toHaveBeenCalled();
	} );

	it( 'skips the reciprocal checkpoint when the call id is unknown', async () => {
		await restoreCheckpointCallback( makeInput() );

		expect( setCheckpoint ).not.toHaveBeenCalled();
	} );

	it( 'clears stale restore reciprocals after a successful restore', async () => {
		mockGetToolCallId.mockReturnValue( 'toolu_restore' );
		mockGetCheckpoints.mockReturnValue( [
			{ id: 'toolu_target', toolId: 'big_sky__show_component', checkpointKeys: [ 'color' ] },
			{
				id: 'toolu_old_redo',
				toolId: 'big_sky__restore_checkpoint',
				checkpointKeys: [],
				requestIntentType: 'redo',
			},
			{ id: 'toolu_legacy', toolId: 'big_sky__restore_checkpoint', checkpointKeys: [] },
			{
				id: 'toolu_other_intent',
				toolId: 'big_sky__restore_checkpoint',
				checkpointKeys: [],
				requestIntentType: 'undo',
			},
			{ id: 'toolu_restore', toolId: 'big_sky__restore_checkpoint', checkpointKeys: [] },
		] );

		await restoreCheckpointCallback( makeInput() );

		expect( ( clearCheckpoint as jest.Mock ).mock.calls.flat() ).toEqual( [
			'toolu_old_redo',
			'toolu_legacy',
		] );
	} );

	it( 'delegates to the provider store when AM does not hold the id', async () => {
		mockHasCheckpoint.mockReturnValue( false );
		const providerCheckpoints = makeProviderCheckpoints();
		mockGetProviderCheckpoints.mockReturnValue( providerCheckpoints );

		const result = await restoreCheckpointCallback( makeInput() );

		expect( providerCheckpoints.restoreCheckpoint ).toHaveBeenCalledWith( 'toolu_target' );
		expect( restoreCheckpoint ).not.toHaveBeenCalled();
		expect( result ).toEqual( {
			result: {
				success: true,
				message: 'I undid the color change.',
				details: { checkpointId: 'toolu_target' },
			},
			returnToAgent: true,
		} );
	} );

	it( 'records the reciprocal in the provider store scoped to the target keys', async () => {
		mockHasCheckpoint.mockReturnValue( false );
		mockGetToolCallId.mockReturnValue( 'toolu_restore' );
		mockGetProviderCheckpointKeys.mockReturnValue( [ 'site_title', 'site_metadata' ] );
		const providerCheckpoints = makeProviderCheckpoints();
		mockGetProviderCheckpoints.mockReturnValue( providerCheckpoints );

		await restoreCheckpointCallback( makeInput() );

		expect( mockGetProviderCheckpointKeys ).toHaveBeenCalledWith( 'toolu_target' );
		expect( providerCheckpoints.setCheckpoint ).toHaveBeenCalledWith(
			'toolu_restore',
			[ 'site_title', 'site_metadata' ],
			{
				toolCallId: 'toolu_restore',
				toolId: 'big_sky__restore_checkpoint',
				summary: 'I undid the color change.',
				restoresCheckpointId: 'toolu_target',
				requestIntentType: 'redo',
				createdByRequestIntentType: 'undo',
			}
		);
		expect( setCheckpoint ).not.toHaveBeenCalled();
	} );

	it( 'skips the reciprocal when the target keys are unreadable', async () => {
		mockHasCheckpoint.mockReturnValue( false );
		mockGetToolCallId.mockReturnValue( 'toolu_restore' );
		const providerCheckpoints = makeProviderCheckpoints();
		mockGetProviderCheckpoints.mockReturnValue( providerCheckpoints );

		const result = await restoreCheckpointCallback( makeInput() );

		expect( providerCheckpoints.setCheckpoint ).not.toHaveBeenCalled();
		expect( providerCheckpoints.restoreCheckpoint ).toHaveBeenCalledWith( 'toolu_target' );
		expect( result.result.success ).toBe( true );
	} );

	it( 'drops the provider reciprocal when a delegated restore fails', async () => {
		mockHasCheckpoint.mockReturnValue( false );
		mockGetToolCallId.mockReturnValue( 'toolu_restore' );
		mockGetProviderCheckpointKeys.mockReturnValue( [ 'site_title' ] );
		const providerCheckpoints = makeProviderCheckpoints();
		providerCheckpoints.restoreCheckpoint.mockRejectedValueOnce( new Error( 'Restore exploded.' ) );
		mockGetProviderCheckpoints.mockReturnValue( providerCheckpoints );

		const result = await restoreCheckpointCallback( makeInput() );

		expect( providerCheckpoints.clearCheckpoint ).toHaveBeenCalledWith( 'toolu_restore' );
		expect( result.result ).toMatchObject( { success: false, error: 'Restore exploded.' } );
	} );

	it( 'reports a failed restore and drops the just-created reciprocal', async () => {
		mockGetToolCallId.mockReturnValue( 'toolu_restore' );
		( restoreCheckpoint as jest.Mock ).mockRejectedValueOnce( new Error( 'Restore exploded.' ) );

		const result = await restoreCheckpointCallback( makeInput() );

		expect( result.result ).toMatchObject( {
			success: false,
			error: 'Restore exploded.',
			details: { checkpointId: 'toolu_target' },
		} );
		expect( clearCheckpoint ).toHaveBeenCalledTimes( 1 );
		expect( clearCheckpoint ).toHaveBeenCalledWith( 'toolu_restore' );
	} );

	it( 'keeps a pre-existing reciprocal when the restore fails', async () => {
		mockGetToolCallId.mockReturnValue( 'toolu_restore' );
		mockHasCheckpoint.mockReturnValue( true );
		( restoreCheckpoint as jest.Mock ).mockRejectedValueOnce( new Error( 'Restore exploded.' ) );

		await restoreCheckpointCallback( makeInput() );

		expect( clearCheckpoint ).not.toHaveBeenCalled();
	} );
} );
