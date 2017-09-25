/**
 * External dependencies
 */
import { expect } from 'chai';
import deepFreeze from 'deep-freeze';

/**
 * Internal dependencies
 */
import { items as itemsReducer, requests as requestsReducer, dataItems as dataItemsReducer, dataRequests as dataRequestsReducer, disconnectRequests as disconnectRequestsReducer } from '../reducer';
import { items as ITEMS_FIXTURE, requests as REQUESTS_FIXTURE, dataItems as DATA_ITEMS_FIXTURE } from './fixture';
import { JETPACK_CONNECTION_STATUS_RECEIVE, JETPACK_CONNECTION_STATUS_REQUEST, JETPACK_CONNECTION_STATUS_REQUEST_SUCCESS, JETPACK_CONNECTION_STATUS_REQUEST_FAILURE, JETPACK_DISCONNECT_REQUEST, JETPACK_DISCONNECT_REQUEST_FAILURE, JETPACK_DISCONNECT_REQUEST_SUCCESS, JETPACK_USER_CONNECTION_DATA_RECEIVE, JETPACK_USER_CONNECTION_DATA_REQUEST, JETPACK_USER_CONNECTION_DATA_REQUEST_SUCCESS, JETPACK_USER_CONNECTION_DATA_REQUEST_FAILURE } from 'state/action-types';

describe( 'reducer', () => {
	describe( 'items', () => {
		it( 'state should default to empty object', () => {
			const state = itemsReducer( undefined, {} );
			expect( state ).to.eql( {} );
		} );

		it( 'should update connection statuses in the items object', () => {
			const stateIn = ITEMS_FIXTURE,
				siteId = 12345678,
				action = {
					type: JETPACK_CONNECTION_STATUS_RECEIVE,
					siteId,
					status: ITEMS_FIXTURE[ 87654321 ]
				};
			const stateOut = itemsReducer( deepFreeze( stateIn ), action );
			expect( stateOut ).to.eql( {
				...ITEMS_FIXTURE,
				[ siteId ]: ITEMS_FIXTURE[ 87654321 ],
			} );
		} );

		it( 'should accummulate connection statuses for separate sites in the items object', () => {
			const stateIn = ITEMS_FIXTURE,
				siteId = 11223344,
				action = {
					type: JETPACK_CONNECTION_STATUS_RECEIVE,
					siteId,
					status: ITEMS_FIXTURE[ 87654321 ]
				};
			const stateOut = itemsReducer( deepFreeze( stateIn ), action );
			expect( stateOut ).to.eql( {
				...ITEMS_FIXTURE,
				[ siteId ]: ITEMS_FIXTURE[ 87654321 ]
			} );
		} );
	} );

	describe( 'requests', () => {
		it( 'state should default to an empty object', () => {
			const state = requestsReducer( undefined, {} );
			expect( state ).to.eql( {} );
		} );

		it( 'should set requesting to true for the specified site when status request starts', () => {
			const stateIn = REQUESTS_FIXTURE,
				siteId = 12345678,
				action = {
					type: JETPACK_CONNECTION_STATUS_REQUEST,
					siteId
				};
			const stateOut = requestsReducer( deepFreeze( stateIn ), action );
			expect( stateOut ).to.eql( {
				...REQUESTS_FIXTURE,
				[ siteId ]: true
			} );
		} );

		it( 'should set requesting to false for the specified site when status request completes successfully', () => {
			const stateIn = REQUESTS_FIXTURE,
				siteId = 87654321,
				action = {
					type: JETPACK_CONNECTION_STATUS_REQUEST_SUCCESS,
					siteId
				};
			const stateOut = requestsReducer( deepFreeze( stateIn ), action );
			expect( stateOut ).to.eql( {
				...REQUESTS_FIXTURE,
				[ siteId ]: false
			} );
		} );

		it( 'should set requesting to false for the specified site when status request completes unsuccessfully', () => {
			const stateIn = REQUESTS_FIXTURE,
				siteId = 87654321,
				action = {
					type: JETPACK_CONNECTION_STATUS_REQUEST_FAILURE,
					siteId
				};
			const stateOut = requestsReducer( deepFreeze( stateIn ), action );
			expect( stateOut ).to.eql( {
				...REQUESTS_FIXTURE,
				[ siteId ]: false
			} );
		} );
	} );

	describe( 'dataItems', () => {
		it( 'state should default to empty object', () => {
			const state = dataItemsReducer( undefined, {} );
			expect( state ).to.eql( {} );
		} );

		it( 'should update user connection data in the items object', () => {
			const stateIn = DATA_ITEMS_FIXTURE,
				siteId = 12345678,
				action = {
					type: JETPACK_USER_CONNECTION_DATA_RECEIVE,
					siteId,
					data: DATA_ITEMS_FIXTURE[ 87654321 ]
				};
			const stateOut = dataItemsReducer( deepFreeze( stateIn ), action );
			expect( stateOut ).to.eql( {
				...DATA_ITEMS_FIXTURE,
				[ siteId ]: DATA_ITEMS_FIXTURE[ 87654321 ],
			} );
		} );

		it( 'should accummulate user connection data for separate sites in the items object', () => {
			const stateIn = DATA_ITEMS_FIXTURE,
				siteId = 11223344,
				action = {
					type: JETPACK_USER_CONNECTION_DATA_RECEIVE,
					siteId,
					data: DATA_ITEMS_FIXTURE[ 87654321 ]
				};
			const stateOut = dataItemsReducer( deepFreeze( stateIn ), action );
			expect( stateOut ).to.eql( {
				...DATA_ITEMS_FIXTURE,
				[ siteId ]: DATA_ITEMS_FIXTURE[ 87654321 ]
			} );
		} );
	} );

	describe( 'dataRequests', () => {
		it( 'state should default to an empty object', () => {
			const state = dataRequestsReducer( undefined, {} );
			expect( state ).to.eql( {} );
		} );

		it( 'should set dataRequests to true for the specified site when data request starts', () => {
			const stateIn = REQUESTS_FIXTURE,
				siteId = 12345678,
				action = {
					type: JETPACK_USER_CONNECTION_DATA_REQUEST,
					siteId
				};
			const stateOut = dataRequestsReducer( deepFreeze( stateIn ), action );
			expect( stateOut ).to.eql( {
				...REQUESTS_FIXTURE,
				[ siteId ]: true
			} );
		} );

		it( 'should set dataRequests to false for the specified site when data request completes successfully', () => {
			const stateIn = REQUESTS_FIXTURE,
				siteId = 87654321,
				action = {
					type: JETPACK_USER_CONNECTION_DATA_REQUEST_SUCCESS,
					siteId
				};
			const stateOut = dataRequestsReducer( deepFreeze( stateIn ), action );
			expect( stateOut ).to.eql( {
				...REQUESTS_FIXTURE,
				[ siteId ]: false
			} );
		} );

		it( 'should set dataRequests to false for the specified site when data request completes unsuccessfully', () => {
			const stateIn = REQUESTS_FIXTURE,
				siteId = 87654321,
				action = {
					type: JETPACK_USER_CONNECTION_DATA_REQUEST_FAILURE,
					siteId
				};
			const stateOut = dataRequestsReducer( deepFreeze( stateIn ), action );
			expect( stateOut ).to.eql( {
				...REQUESTS_FIXTURE,
				[ siteId ]: false
			} );
		} );
	} );

	describe( 'disconnectRequests', () => {
		it( 'state should default to an empty object', () => {
			const state = disconnectRequestsReducer( undefined, {} );
			expect( state ).to.eql( {} );
		} );

		it( 'should set requesting to true for the specified site when disconnect request starts', () => {
			const stateIn = REQUESTS_FIXTURE,
				siteId = 12345678,
				action = {
					type: JETPACK_DISCONNECT_REQUEST,
					siteId
				};
			const stateOut = disconnectRequestsReducer( deepFreeze( stateIn ), action );
			expect( stateOut ).to.eql( {
				...REQUESTS_FIXTURE,
				[ siteId ]: true
			} );
		} );

		it( 'should set requesting to false for the specified site when disconnect request completes successfully', () => {
			const stateIn = REQUESTS_FIXTURE,
				siteId = 87654321,
				action = {
					type: JETPACK_DISCONNECT_REQUEST_SUCCESS,
					siteId
				};
			const stateOut = disconnectRequestsReducer( deepFreeze( stateIn ), action );
			expect( stateOut ).to.eql( {
				...REQUESTS_FIXTURE,
				[ siteId ]: false
			} );
		} );

		it( 'should set requesting to false for the specified site when disconnect request completes unsuccessfully', () => {
			const stateIn = REQUESTS_FIXTURE,
				siteId = 87654321,
				action = {
					type: JETPACK_DISCONNECT_REQUEST_FAILURE,
					siteId
				};
			const stateOut = disconnectRequestsReducer( deepFreeze( stateIn ), action );

			expect( stateOut ).to.eql( {
				...REQUESTS_FIXTURE,
				[ siteId ]: false
			} );
		} );
	} );
} );
