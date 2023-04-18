import {
	JETPACK_BACKUP_STAGING_LIST_REQUEST,
	JETPACK_BACKUP_STAGING_LIST_REQUEST_SUCCESS,
	JETPACK_BACKUP_STAGING_LIST_REQUEST_FAILURE,
} from 'calypso/state/action-types';
import { stagingSitesList } from '../reducer';

const TEST_SITE_ID = 123456;
const defaultState = {
	hasFetchedStagingSitesList: false,
	isFetchingStagingSitesList: false,
	stagingSitesList: [],
};
const testActions = {
	request: {
		type: JETPACK_BACKUP_STAGING_LIST_REQUEST,
		siteId: TEST_SITE_ID,
	},
	successWithSites: {
		type: JETPACK_BACKUP_STAGING_LIST_REQUEST_SUCCESS,
		siteId: TEST_SITE_ID,
		stagingSitesList: [
			{
				blog_id: 123456,
				domain: 'test1.jurassic.ninja',
				siteurl: 'https://test1.jurassic.ninja',
				staging: true,
			},
			{
				blog_id: 234567,
				domain: 'test2.jurassic.ninja',
				siteurl: 'https://test2.jurassic.ninja',
				staging: true,
			},
			{
				blog_id: 345678,
				domain: 'test3.jurassic.ninja',
				siteurl: 'https://test3.jurassic.ninja',
				staging: true,
			},
		],
	},
	successWithoutSites: {
		type: JETPACK_BACKUP_STAGING_LIST_REQUEST_SUCCESS,
		siteId: TEST_SITE_ID,
		stagingSitesList: [],
	},
	failure: {
		type: JETPACK_BACKUP_STAGING_LIST_REQUEST_FAILURE,
		siteId: TEST_SITE_ID,
	},
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
