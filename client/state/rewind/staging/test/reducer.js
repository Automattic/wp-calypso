import { BACKUP_STAGING_UPDATE_REQUEST } from '../constants';
import { stagingSitesList, updateStagingFlagRequestStatus } from '../reducer';
import { testActions, updateStagingActions } from './fixtures';

const defaultState = {
	hasFetchedStagingSitesList: false,
	isFetchingStagingSitesList: false,
	sites: [],
};

describe( 'hasFetchedStagingSitesList', () => {
	test( 'should return false if JETPACK_BACKUP_STAGING_LIST_REQUEST action is dispatched', () => {
		expect( stagingSitesList( defaultState, testActions.request ).hasFetchedStagingSitesList ).toBe(
			false
		);
	} );

	test( 'should return true if JETPACK_BACKUP_STAGING_LIST_REQUEST_SUCCESS action is dispatched', () => {
		expect(
			stagingSitesList( defaultState, testActions.successWithSites ).hasFetchedStagingSitesList
		).toBe( true );
	} );

	test( 'should return false if JETPACK_BACKUP_STAGING_LIST_REQUEST_FAILURE action is dispatched', () => {
		expect( stagingSitesList( defaultState, testActions.failure ).hasFetchedStagingSitesList ).toBe(
			false
		);
	} );
} );

describe( 'isFetchingStagingSitesList', () => {
	test( 'should return true if JETPACK_BACKUP_STAGING_LIST_REQUEST action is dispatched', () => {
		expect( stagingSitesList( defaultState, testActions.request ).isFetchingStagingSitesList ).toBe(
			true
		);
	} );

	test( 'should return false if JETPACK_BACKUP_STAGING_LIST_REQUEST_SUCCESS action is dispatched', () => {
		expect(
			stagingSitesList( defaultState, testActions.successWithSites ).isFetchingStagingSitesList
		).toBe( false );
	} );

	test( 'should return false if JETPACK_BACKUP_STAGING_LIST_REQUEST_FAILURE action is dispatched', () => {
		expect( stagingSitesList( defaultState, testActions.failure ).isFetchingStagingSitesList ).toBe(
			false
		);
	} );
} );

describe( 'mark sites as staging', () => {
	const updateStagingDefaultState = BACKUP_STAGING_UPDATE_REQUEST.UNSUBMITTED;

	test( 'should return UNSUBMITTED if a unrelated action is dispatched', () => {
		expect(
			updateStagingFlagRequestStatus( updateStagingDefaultState, {
				type: 'JETPACK_BACKUP_STAGING_LIST_REQUEST',
			} )
		).toBe( BACKUP_STAGING_UPDATE_REQUEST.UNSUBMITTED );
	} );

	describe( 'updateBackupRetentionRequestStatus', () => {
		test( 'should return PENDING if JETPACK_BACKUP_UPDATE_REQUEST action is dispatched', () => {
			expect(
				updateStagingFlagRequestStatus( updateStagingDefaultState, updateStagingActions.request )
			).toBe( BACKUP_STAGING_UPDATE_REQUEST.PENDING );
		} );

		test( 'should return SUCCESS if JETPACK_BACKUP_UPDATE_REQUEST_SUCCESS action is dispatched', () => {
			expect(
				updateStagingFlagRequestStatus( updateStagingDefaultState, updateStagingActions.success )
			).toBe( BACKUP_STAGING_UPDATE_REQUEST.SUCCESS );
		} );

		test( 'should return FAILED if JETPACK_BACKUP_UPDATE_REQUEST_FAILURE action is dispatched', () => {
			expect(
				updateStagingFlagRequestStatus( updateStagingDefaultState, updateStagingActions.failure )
			).toBe( BACKUP_STAGING_UPDATE_REQUEST.FAILED );
		} );
	} );
} );
