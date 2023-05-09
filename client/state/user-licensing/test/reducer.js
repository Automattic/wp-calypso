/**
 * @jest-environment jsdom
 */

import {
	USER_LICENSES_REQUEST,
	USER_LICENSES_RECEIVE,
	USER_LICENSES_COUNTS_RECEIVE,
} from 'calypso/state/action-types';
import * as reducers from 'calypso/state/user-licensing/reducer';

describe( 'reducer', () => {
	describe( '#hasFetchedLicenses', () => {
		test( 'should return true on request success', () => {
			const { hasFetchedLicenses } = reducers;

			const state = undefined;
			const action = { type: USER_LICENSES_RECEIVE };
			expect( hasFetchedLicenses( state, action ) ).toEqual( true );
		} );
	} );

	describe( '#licensesFetching', () => {
		test( 'should return true on request start', () => {
			const { licensesFetching } = reducers;

			const state = undefined;
			const action = { type: USER_LICENSES_REQUEST };
			expect( licensesFetching( state, action ) ).toEqual( true );
		} );

		test( 'should return false on request success', () => {
			const { licensesFetching } = reducers;

			const state = undefined;
			const action = { type: USER_LICENSES_RECEIVE };
			expect( licensesFetching( state, action ) ).toEqual( false );
		} );
	} );

	describe( '#licenses', () => {
		test( 'should return the value of licenses on request success', () => {
			const { licenses } = reducers;

			const state = undefined;
			const action = {
				type: USER_LICENSES_RECEIVE,
				licenses: [ 'foo' ],
			};
			expect( licenses( state, action ) ).toEqual( action.licenses );
		} );
	} );

	describe( '#counts', () => {
		test( 'should return the value of counts on request success', () => {
			const { counts } = reducers;

			const state = undefined;
			const action = {
				type: USER_LICENSES_COUNTS_RECEIVE,
				counts: [ 'foo' ],
			};
			expect( counts( state, action ) ).toEqual( action.counts );
		} );
	} );
} );
