import { stagingSitesList } from '../reducer';
import { testActions } from './fixtures';

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
