import {
	JETPACK_BACKUP_STAGING_GET_REQUEST,
	JETPACK_BACKUP_STAGING_GET_REQUEST_SUCCESS,
	JETPACK_BACKUP_STAGING_GET_REQUEST_FAILURE,
	JETPACK_BACKUP_STAGING_SET,
} from 'calypso/state/action-types';
import { BACKUP_STAGING_UPDATE_REQUEST } from '../constants';
import { stagingSitesList, updateStagingFlagRequestStatus, site } from '../reducer';
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

describe( 'fetch site staging info', () => {
	test( 'should return hasFetched = false and isFetching = true if JETPACK_BACKUP_STAGING_INFO_REQUEST action is dispatched', () => {
		const siteReducer = site( undefined, {
			type: JETPACK_BACKUP_STAGING_GET_REQUEST,
			siteId: 111111,
		} );

		expect( siteReducer.hasFetched ).toBe( false );
		expect( siteReducer.isFetching ).toBe( true );
	} );

	test( 'should return hasFetched = true, isFetching = false and site info if JETPACK_BACKUP_STAGING_INFO_REQUEST_SUCCESS action is dispatched', () => {
		const siteInfo = {
			blog_id: 222222,
			domain: 'test1.jurassic.ninja',
			siteurl: 'https://test1.jurassic.ninja',
			staging: true,
		};

		const siteReducer = site( undefined, {
			type: JETPACK_BACKUP_STAGING_GET_REQUEST_SUCCESS,
			siteId: 222222,
			site: siteInfo,
		} );

		expect( siteReducer.hasFetched ).toBe( true );
		expect( siteReducer.isFetching ).toBe( false );
		expect( siteReducer.info ).toEqual( siteInfo );
	} );

	test( 'should return hasFetched = false and isFetching = false if JETPACK_BACKUP_STAGING_INFO_REQUEST_FAILURE action is dispatched', () => {
		const siteReducer = site( undefined, {
			type: JETPACK_BACKUP_STAGING_GET_REQUEST_FAILURE,
			siteId: 333333,
		} );

		expect( siteReducer.hasFetched ).toBe( false );
		expect( siteReducer.isFetching ).toBe( false );
	} );
} );

describe( 'set staging flag after updating', () => {
	test( 'should return the new staging flag after dispatching JETPACK_BACKUP_STAGING_SET action', () => {
		const previousState = {
			isFetching: false,
			hasFetched: true,
			info: {
				blog_id: 222222,
				domain: 'test1.jurassic.ninja',
				siteurl: 'https://test1.jurassic.ninja',
				staging: false,
			},
		};

		const action = {
			type: JETPACK_BACKUP_STAGING_SET,
			siteId: 222222,
			staging: true,
		};

		expect( site( previousState, action ).info.staging ).toBe( true );
	} );
} );
