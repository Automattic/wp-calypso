/** @format */

/**
 * External dependencies
 */
import { expect } from 'chai';
import deepFreeze from 'deep-freeze';

/**
 * Internal dependencies
 */
import { items as itemsReducer, requests as requestsReducer } from '../reducer';
import { items as ITEMS_FIXTURE, requests as REQUESTS_FIXTURE } from './fixture';
import {
	JETPACK_JUMPSTART_ACTIVATE,
	JETPACK_JUMPSTART_ACTIVATE_SUCCESS,
	JETPACK_JUMPSTART_ACTIVATE_FAILURE,
	JETPACK_JUMPSTART_DEACTIVATE,
	JETPACK_JUMPSTART_DEACTIVATE_SUCCESS,
	JETPACK_JUMPSTART_DEACTIVATE_FAILURE,
	JETPACK_JUMPSTART_STATUS_RECEIVE,
	JETPACK_JUMPSTART_STATUS_REQUEST,
	JETPACK_JUMPSTART_STATUS_REQUEST_SUCCESS,
	JETPACK_JUMPSTART_STATUS_REQUEST_FAILURE,
	SERIALIZE,
	DESERIALIZE,
} from 'client/state/action-types';

describe( 'reducer', () => {
	describe( 'items', () => {
		test( 'state should default to empty object', () => {
			const state = itemsReducer( undefined, {} );
			expect( state ).to.eql( {} );
		} );

		test( 'should store jumpstart statuses in the items object', () => {
			const stateIn = {},
				siteId = 12345678,
				action = {
					type: JETPACK_JUMPSTART_ACTIVATE_SUCCESS,
					siteId,
				};
			const stateOut = itemsReducer( deepFreeze( stateIn ), action );
			expect( stateOut ).to.eql( {
				[ siteId ]: 'jumpstart_activated',
			} );
		} );

		test( 'should mark the site jumpstart status as active in the items object', () => {
			const stateIn = ITEMS_FIXTURE,
				siteId = 87654321,
				action = {
					type: JETPACK_JUMPSTART_ACTIVATE_SUCCESS,
					siteId,
				};
			const stateOut = itemsReducer( deepFreeze( stateIn ), action );
			expect( stateOut ).to.eql( {
				...ITEMS_FIXTURE,
				[ siteId ]: 'jumpstart_activated',
			} );
		} );

		test( 'should mark the site jumpstart status as inactive in the items object', () => {
			const stateIn = ITEMS_FIXTURE,
				siteId = 12345678,
				action = {
					type: JETPACK_JUMPSTART_DEACTIVATE_SUCCESS,
					siteId,
				};
			const stateOut = itemsReducer( deepFreeze( stateIn ), action );
			expect( stateOut ).to.eql( {
				...ITEMS_FIXTURE,
				12345678: 'jumpstart_dismissed',
			} );
		} );

		test( 'should update jumpstart statuses in the items object', () => {
			const stateIn = ITEMS_FIXTURE,
				siteId = 12345678,
				action = {
					type: JETPACK_JUMPSTART_STATUS_RECEIVE,
					siteId,
					status: 'example_status',
				};
			const stateOut = itemsReducer( deepFreeze( stateIn ), action );
			expect( stateOut ).to.eql( {
				...ITEMS_FIXTURE,
				[ siteId ]: 'example_status',
			} );
		} );

		test( 'should accummulate jumpstart statuses for separate sites in the items object', () => {
			const stateIn = ITEMS_FIXTURE,
				siteId = 11223344,
				action = {
					type: JETPACK_JUMPSTART_STATUS_RECEIVE,
					siteId,
					status: 'example_status',
				};
			const stateOut = itemsReducer( deepFreeze( stateIn ), action );
			expect( stateOut ).to.eql( {
				...ITEMS_FIXTURE,
				[ siteId ]: 'example_status',
			} );
		} );

		test( 'should not persist state', () => {
			const stateIn = ITEMS_FIXTURE,
				action = {
					type: SERIALIZE,
				};
			const stateOut = itemsReducer( deepFreeze( stateIn ), action );
			expect( stateOut ).to.eql( {} );
		} );

		test( 'should not load persisted state', () => {
			const stateIn = ITEMS_FIXTURE,
				action = {
					type: DESERIALIZE,
				};
			const stateOut = itemsReducer( deepFreeze( stateIn ), action );
			expect( stateOut ).to.eql( {} );
		} );
	} );

	describe( 'requests', () => {
		test( 'state should default to an empty object', () => {
			const state = requestsReducer( undefined, {} );
			expect( state ).to.eql( {} );
		} );

		test( 'should set activating to true for the specified site when activation starts', () => {
			const stateIn = REQUESTS_FIXTURE,
				siteId = 87654321,
				action = {
					type: JETPACK_JUMPSTART_ACTIVATE,
					siteId,
				};
			const stateOut = requestsReducer( deepFreeze( stateIn ), action );
			expect( stateOut ).to.eql( {
				...REQUESTS_FIXTURE,
				[ siteId ]: {
					...REQUESTS_FIXTURE[ siteId ],
					activating: true,
				},
			} );
		} );

		test( 'should set activating to false for the specified site when activation completes successfully', () => {
			const stateIn = REQUESTS_FIXTURE,
				siteId = 12345678,
				action = {
					type: JETPACK_JUMPSTART_ACTIVATE_SUCCESS,
					siteId,
				};
			const stateOut = requestsReducer( deepFreeze( stateIn ), action );
			expect( stateOut ).to.eql( {
				...REQUESTS_FIXTURE,
				[ siteId ]: {
					...REQUESTS_FIXTURE[ siteId ],
					activating: false,
				},
			} );
		} );

		test( 'should set activating to false for the specified site when activation completes unsuccessfully', () => {
			const stateIn = REQUESTS_FIXTURE,
				siteId = 12345678,
				action = {
					type: JETPACK_JUMPSTART_ACTIVATE_FAILURE,
					siteId,
				};
			const stateOut = requestsReducer( deepFreeze( stateIn ), action );
			expect( stateOut ).to.eql( {
				...REQUESTS_FIXTURE,
				[ siteId ]: {
					...REQUESTS_FIXTURE[ siteId ],
					activating: false,
				},
			} );
		} );

		test( 'should set deactivating to true for the specified site when deactivation starts', () => {
			const stateIn = REQUESTS_FIXTURE,
				siteId = 12345678,
				action = {
					type: JETPACK_JUMPSTART_DEACTIVATE,
					siteId,
				};
			const stateOut = requestsReducer( deepFreeze( stateIn ), action );
			expect( stateOut ).to.eql( {
				...REQUESTS_FIXTURE,
				[ siteId ]: {
					...REQUESTS_FIXTURE[ siteId ],
					deactivating: true,
				},
			} );
		} );

		test( 'should set deactivating to false for the specified site when deactivation completes successfully', () => {
			const stateIn = REQUESTS_FIXTURE,
				siteId = 87654321,
				action = {
					type: JETPACK_JUMPSTART_DEACTIVATE_SUCCESS,
					siteId,
				};
			const stateOut = requestsReducer( deepFreeze( stateIn ), action );
			expect( stateOut ).to.eql( {
				...REQUESTS_FIXTURE,
				[ siteId ]: {
					...REQUESTS_FIXTURE[ siteId ],
					deactivating: false,
				},
			} );
		} );

		test( 'should set deactivating to false for the specified site when deactivation completes unsuccessfully', () => {
			const stateIn = REQUESTS_FIXTURE,
				siteId = 87654321,
				action = {
					type: JETPACK_JUMPSTART_DEACTIVATE_FAILURE,
					siteId,
				};
			const stateOut = requestsReducer( deepFreeze( stateIn ), action );
			expect( stateOut ).to.eql( {
				...REQUESTS_FIXTURE,
				[ siteId ]: {
					...REQUESTS_FIXTURE[ siteId ],
					deactivating: false,
				},
			} );
		} );

		test( 'should set requesting to true for the specified site when status request starts', () => {
			const stateIn = REQUESTS_FIXTURE,
				siteId = 12345678,
				action = {
					type: JETPACK_JUMPSTART_STATUS_REQUEST,
					siteId,
				};
			const stateOut = requestsReducer( deepFreeze( stateIn ), action );
			expect( stateOut ).to.eql( {
				...REQUESTS_FIXTURE,
				[ siteId ]: {
					...REQUESTS_FIXTURE[ siteId ],
					requesting: true,
				},
			} );
		} );

		test( 'should set requesting to false for the specified site when status request completes successfully', () => {
			const stateIn = REQUESTS_FIXTURE,
				siteId = 11223344,
				action = {
					type: JETPACK_JUMPSTART_STATUS_REQUEST_SUCCESS,
					siteId,
				};
			const stateOut = requestsReducer( deepFreeze( stateIn ), action );
			expect( stateOut ).to.eql( {
				...REQUESTS_FIXTURE,
				[ siteId ]: {
					...REQUESTS_FIXTURE[ siteId ],
					requesting: false,
				},
			} );
		} );

		test( 'should set requesting to false for the specified site when status request completes unsuccessfully', () => {
			const stateIn = REQUESTS_FIXTURE,
				siteId = 11223344,
				action = {
					type: JETPACK_JUMPSTART_STATUS_REQUEST_FAILURE,
					siteId,
				};
			const stateOut = requestsReducer( deepFreeze( stateIn ), action );
			expect( stateOut ).to.eql( {
				...REQUESTS_FIXTURE,
				[ siteId ]: {
					...REQUESTS_FIXTURE[ siteId ],
					requesting: false,
				},
			} );
		} );

		test( 'should not persist state', () => {
			const stateIn = REQUESTS_FIXTURE,
				action = {
					type: SERIALIZE,
				};
			const stateOut = requestsReducer( deepFreeze( stateIn ), action );
			expect( stateOut ).to.eql( {} );
		} );

		test( 'should not load persisted state', () => {
			const stateIn = REQUESTS_FIXTURE,
				action = {
					type: DESERIALIZE,
				};
			const stateOut = requestsReducer( deepFreeze( stateIn ), action );
			expect( stateOut ).to.eql( {} );
		} );
	} );
} );
