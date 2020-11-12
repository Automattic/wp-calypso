/**
 * External dependencies
 */
import { expect } from 'chai';
import deepFreeze from 'deep-freeze';

/**
 * Internal dependencies
 */
import {
	items as itemsReducer,
	requests as requestsReducer,
	dataItems as dataItemsReducer,
	dataRequests as dataRequestsReducer,
	disconnectRequests as disconnectRequestsReducer,
} from '../reducer';
import {
	items as ITEMS_FIXTURE,
	requests as REQUESTS_FIXTURE,
	dataItems as DATA_ITEMS_FIXTURE,
} from './fixture';
import {
	JETPACK_CONNECTION_STATUS_RECEIVE,
	JETPACK_CONNECTION_STATUS_REQUEST,
	JETPACK_CONNECTION_STATUS_REQUEST_SUCCESS,
	JETPACK_CONNECTION_STATUS_REQUEST_FAILURE,
	JETPACK_DISCONNECT_REQUEST,
	JETPACK_DISCONNECT_REQUEST_FAILURE,
	JETPACK_DISCONNECT_REQUEST_SUCCESS,
	JETPACK_USER_CONNECTION_DATA_RECEIVE,
	JETPACK_USER_CONNECTION_DATA_REQUEST,
	JETPACK_USER_CONNECTION_DATA_REQUEST_SUCCESS,
	JETPACK_USER_CONNECTION_DATA_REQUEST_FAILURE,
} from 'calypso/state/action-types';

describe( 'reducer', () => {
	describe( 'items', () => {
		test( 'state should default to empty object', () => {
			const state = itemsReducer( undefined, {} );
			expect( state ).to.eql( {} );
		} );

		test( 'should update connection statuses in the items object', () => {
			const stateIn = ITEMS_FIXTURE;
			const siteId = 12345678;
			const action = {
				type: JETPACK_CONNECTION_STATUS_RECEIVE,
				siteId,
				status: ITEMS_FIXTURE[ 87654321 ],
			};
			const stateOut = itemsReducer( deepFreeze( stateIn ), action );
			expect( stateOut ).to.eql( {
				...ITEMS_FIXTURE,
				[ siteId ]: ITEMS_FIXTURE[ 87654321 ],
			} );
		} );

		test( 'should accummulate connection statuses for separate sites in the items object', () => {
			const stateIn = ITEMS_FIXTURE;
			const siteId = 11223344;
			const action = {
				type: JETPACK_CONNECTION_STATUS_RECEIVE,
				siteId,
				status: ITEMS_FIXTURE[ 87654321 ],
			};
			const stateOut = itemsReducer( deepFreeze( stateIn ), action );
			expect( stateOut ).to.eql( {
				...ITEMS_FIXTURE,
				[ siteId ]: ITEMS_FIXTURE[ 87654321 ],
			} );
		} );
	} );

	describe( 'requests', () => {
		test( 'state should default to an empty object', () => {
			const state = requestsReducer( undefined, {} );
			expect( state ).to.eql( {} );
		} );

		test( 'should set requesting to true for the specified site when status request starts', () => {
			const stateIn = REQUESTS_FIXTURE;
			const siteId = 12345678;
			const action = {
				type: JETPACK_CONNECTION_STATUS_REQUEST,
				siteId,
			};
			const stateOut = requestsReducer( deepFreeze( stateIn ), action );
			expect( stateOut ).to.eql( {
				...REQUESTS_FIXTURE,
				[ siteId ]: true,
			} );
		} );

		test( 'should set requesting to false for the specified site when status request completes successfully', () => {
			const stateIn = REQUESTS_FIXTURE;
			const siteId = 87654321;
			const action = {
				type: JETPACK_CONNECTION_STATUS_REQUEST_SUCCESS,
				siteId,
			};
			const stateOut = requestsReducer( deepFreeze( stateIn ), action );
			expect( stateOut ).to.eql( {
				...REQUESTS_FIXTURE,
				[ siteId ]: false,
			} );
		} );

		test( 'should set requesting to false for the specified site when status request completes unsuccessfully', () => {
			const stateIn = REQUESTS_FIXTURE;
			const siteId = 87654321;
			const action = {
				type: JETPACK_CONNECTION_STATUS_REQUEST_FAILURE,
				siteId,
			};
			const stateOut = requestsReducer( deepFreeze( stateIn ), action );
			expect( stateOut ).to.eql( {
				...REQUESTS_FIXTURE,
				[ siteId ]: false,
			} );
		} );
	} );

	describe( 'dataItems', () => {
		test( 'state should default to empty object', () => {
			const state = dataItemsReducer( undefined, {} );
			expect( state ).to.eql( {} );
		} );

		test( 'should update user connection data in the items object', () => {
			const stateIn = DATA_ITEMS_FIXTURE;
			const siteId = 12345678;
			const action = {
				type: JETPACK_USER_CONNECTION_DATA_RECEIVE,
				siteId,
				data: DATA_ITEMS_FIXTURE[ 87654321 ],
			};
			const stateOut = dataItemsReducer( deepFreeze( stateIn ), action );
			expect( stateOut ).to.eql( {
				...DATA_ITEMS_FIXTURE,
				[ siteId ]: DATA_ITEMS_FIXTURE[ 87654321 ],
			} );
		} );

		test( 'should accummulate user connection data for separate sites in the items object', () => {
			const stateIn = DATA_ITEMS_FIXTURE;
			const siteId = 11223344;
			const action = {
				type: JETPACK_USER_CONNECTION_DATA_RECEIVE,
				siteId,
				data: DATA_ITEMS_FIXTURE[ 87654321 ],
			};
			const stateOut = dataItemsReducer( deepFreeze( stateIn ), action );
			expect( stateOut ).to.eql( {
				...DATA_ITEMS_FIXTURE,
				[ siteId ]: DATA_ITEMS_FIXTURE[ 87654321 ],
			} );
		} );
	} );

	describe( 'dataRequests', () => {
		test( 'state should default to an empty object', () => {
			const state = dataRequestsReducer( undefined, {} );
			expect( state ).to.eql( {} );
		} );

		test( 'should set dataRequests to true for the specified site when data request starts', () => {
			const stateIn = REQUESTS_FIXTURE;
			const siteId = 12345678;
			const action = {
				type: JETPACK_USER_CONNECTION_DATA_REQUEST,
				siteId,
			};
			const stateOut = dataRequestsReducer( deepFreeze( stateIn ), action );
			expect( stateOut ).to.eql( {
				...REQUESTS_FIXTURE,
				[ siteId ]: true,
			} );
		} );

		test( 'should set dataRequests to false for the specified site when data request completes successfully', () => {
			const stateIn = REQUESTS_FIXTURE;
			const siteId = 87654321;
			const action = {
				type: JETPACK_USER_CONNECTION_DATA_REQUEST_SUCCESS,
				siteId,
			};
			const stateOut = dataRequestsReducer( deepFreeze( stateIn ), action );
			expect( stateOut ).to.eql( {
				...REQUESTS_FIXTURE,
				[ siteId ]: false,
			} );
		} );

		test( 'should set dataRequests to false for the specified site when data request completes unsuccessfully', () => {
			const stateIn = REQUESTS_FIXTURE;
			const siteId = 87654321;
			const action = {
				type: JETPACK_USER_CONNECTION_DATA_REQUEST_FAILURE,
				siteId,
			};
			const stateOut = dataRequestsReducer( deepFreeze( stateIn ), action );
			expect( stateOut ).to.eql( {
				...REQUESTS_FIXTURE,
				[ siteId ]: false,
			} );
		} );
	} );

	describe( 'disconnectRequests', () => {
		test( 'state should default to an empty object', () => {
			const state = disconnectRequestsReducer( undefined, {} );
			expect( state ).to.eql( {} );
		} );

		test( 'should set requesting to true for the specified site when disconnect request starts', () => {
			const stateIn = REQUESTS_FIXTURE;
			const siteId = 12345678;
			const action = {
				type: JETPACK_DISCONNECT_REQUEST,
				siteId,
			};
			const stateOut = disconnectRequestsReducer( deepFreeze( stateIn ), action );
			expect( stateOut ).to.eql( {
				...REQUESTS_FIXTURE,
				[ siteId ]: true,
			} );
		} );

		test( 'should set requesting to false for the specified site when disconnect request completes successfully', () => {
			const stateIn = REQUESTS_FIXTURE;
			const siteId = 87654321;
			const action = {
				type: JETPACK_DISCONNECT_REQUEST_SUCCESS,
				siteId,
			};
			const stateOut = disconnectRequestsReducer( deepFreeze( stateIn ), action );
			expect( stateOut ).to.eql( {
				...REQUESTS_FIXTURE,
				[ siteId ]: false,
			} );
		} );

		test( 'should set requesting to false for the specified site when disconnect request completes unsuccessfully', () => {
			const stateIn = REQUESTS_FIXTURE;
			const siteId = 87654321;
			const action = {
				type: JETPACK_DISCONNECT_REQUEST_FAILURE,
				siteId,
			};
			const stateOut = disconnectRequestsReducer( deepFreeze( stateIn ), action );

			expect( stateOut ).to.eql( {
				...REQUESTS_FIXTURE,
				[ siteId ]: false,
			} );
		} );
	} );
} );
