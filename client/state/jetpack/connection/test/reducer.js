/**
 * External dependencies
 */
import { expect } from 'chai';
import deepFreeze from 'deep-freeze';

/**
 * Internal dependencies
 */
import {
	JETPACK_CONNECTION_STATUS_RECEIVE,
	JETPACK_CONNECTION_STATUS_REQUEST,
	JETPACK_CONNECTION_STATUS_REQUEST_SUCCESS,
	JETPACK_CONNECTION_STATUS_REQUEST_FAILURE,
	JETPACK_DISCONNECT_REQUEST,
	JETPACK_DISCONNECT_REQUEST_FAILURE,
	JETPACK_DISCONNECT_REQUEST_SUCCESS,
	SERIALIZE,
	DESERIALIZE
} from 'state/action-types';
import {
	items as itemsReducer,
	requests as requestsReducer,
	disconnectRequests as disconnectRequestsReducer
} from '../reducer';
import {
	items as ITEMS_FIXTURE,
	requests as REQUESTS_FIXTURE
} from './fixture';

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

		it( 'should not persist state', () => {
			const stateIn = ITEMS_FIXTURE,
				action = {
					type: SERIALIZE
				};
			const stateOut = itemsReducer( deepFreeze( stateIn ), action );
			expect( stateOut ).to.eql( {} );
		} );

		it( 'should not load persisted state', () => {
			const stateIn = ITEMS_FIXTURE,
				action = {
					type: DESERIALIZE
				};
			const stateOut = itemsReducer( deepFreeze( stateIn ), action );
			expect( stateOut ).to.eql( {} );
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

		it( 'should not persist state', () => {
			const stateIn = REQUESTS_FIXTURE,
				action = {
					type: SERIALIZE
				};
			const stateOut = requestsReducer( deepFreeze( stateIn ), action );
			expect( stateOut ).to.eql( {} );
		} );

		it( 'should not load persisted state', () => {
			const stateIn = REQUESTS_FIXTURE,
				action = {
					type: DESERIALIZE
				};
			const stateOut = requestsReducer( deepFreeze( stateIn ), action );
			expect( stateOut ).to.eql( {} );
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

		it( 'should not persist state', () => {
			const stateIn = REQUESTS_FIXTURE,
				action = {
					type: SERIALIZE
				};
			const stateOut = disconnectRequestsReducer( deepFreeze( stateIn ), action );
			expect( stateOut ).to.eql( {} );
		} );

		it( 'should not load persisted state', () => {
			const stateIn = REQUESTS_FIXTURE,
				action = {
					type: DESERIALIZE
				};
			const stateOut = disconnectRequestsReducer( deepFreeze( stateIn ), action );
			expect( stateOut ).to.eql( {} );
		} );
	} );
} );
