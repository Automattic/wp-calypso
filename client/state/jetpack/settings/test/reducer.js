/**
 * External dependencies
 */
import { expect } from 'chai';
import deepFreeze from 'deep-freeze';

/**
 * Internal dependencies
 */
import {
	JETPACK_SETTINGS_RECEIVE,
	JETPACK_SETTINGS_REQUEST,
	JETPACK_SETTINGS_REQUEST_FAILURE,
	JETPACK_SETTINGS_REQUEST_SUCCESS,
	JETPACK_SETTINGS_UPDATE,
	JETPACK_SETTINGS_UPDATE_SUCCESS,
	JETPACK_SETTINGS_UPDATE_FAILURE,
	SERIALIZE,
	DESERIALIZE
} from 'state/action-types';
import {
	items as itemsReducer,
	requests as requestsReducer
} from '../reducer';

import {
	settings as SETTINGS_FIXTURE,
	requests as REQUESTS_FIXTURE
} from './fixture';

describe( 'reducer', () => {
	describe( 'items', () => {
		it( 'state should default to empty object', () => {
			const state = itemsReducer( undefined, {} );
			expect( state ).to.eql( {} );
		} );

		it( 'should store new settings in the items object', () => {
			const stateIn = {},
				siteId = 12345678,
				action = {
					type: JETPACK_SETTINGS_RECEIVE,
					siteId,
					settings: SETTINGS_FIXTURE[ siteId ]
				};
			const stateOut = itemsReducer( deepFreeze( stateIn ), action );
			expect( stateOut ).to.eql( {
				12345678: SETTINGS_FIXTURE[ siteId ]
			} );
		} );

		it( 'should store new settings to the items object for the right site', () => {
			const siteId = 87654321,
				stateIn = {
					12345678: SETTINGS_FIXTURE[ 12345678 ]
				},
				action = {
					type: JETPACK_SETTINGS_RECEIVE,
					siteId,
					settings: SETTINGS_FIXTURE[ siteId ]
				};
			const stateOut = itemsReducer( deepFreeze( stateIn ), action );
			expect( stateOut ).to.eql( SETTINGS_FIXTURE );
		} );

		it( 'should accumulate new settings to the items object for the right site', () => {
			const siteId = 12345678,
				stateIn = SETTINGS_FIXTURE,
				action = {
					type: JETPACK_SETTINGS_RECEIVE,
					siteId,
					settings: SETTINGS_FIXTURE[ 87654321 ]
				};
			const stateOut = itemsReducer( deepFreeze( stateIn ), action );
			expect( stateOut ).to.eql( {
				12345678: Object.assign( {}, SETTINGS_FIXTURE[ 12345678 ], SETTINGS_FIXTURE[ 87654321 ] ),
				87654321: SETTINGS_FIXTURE[ 87654321 ],
			} );
		} );

		it( 'should replace settings in the items object when settings are already loaded for a site', () => {
			const siteId = 12345678,
				stateIn = {
					12345678: SETTINGS_FIXTURE[ siteId ]
				},
				action = {
					type: JETPACK_SETTINGS_RECEIVE,
					siteId,
					settings: { ...SETTINGS_FIXTURE[ siteId ], test_setting: 123 }
				};
			const stateOut = itemsReducer( deepFreeze( stateIn ), action );
			expect( stateOut ).to.eql( {
				12345678: { ...SETTINGS_FIXTURE[ siteId ], test_setting: 123 }
			} );
		} );

		it( 'should update settings in the items object', () => {
			const siteId = 12345678,
				stateIn = {
					12345678: SETTINGS_FIXTURE[ siteId ]
				},
				action = {
					type: JETPACK_SETTINGS_UPDATE_SUCCESS,
					siteId,
					settings: { test_setting: 123 }
				};
			const stateOut = itemsReducer( deepFreeze( stateIn ), action );
			expect( stateOut ).to.eql( {
				12345678: { ...SETTINGS_FIXTURE[ siteId ], test_setting: 123 }
			} );
		} );

		it( 'should not persist state', () => {
			const stateIn = SETTINGS_FIXTURE,
				action = {
					type: SERIALIZE
				};
			const stateOut = itemsReducer( deepFreeze( stateIn ), action );
			expect( stateOut ).to.eql( {} );
		} );

		it( 'should not load persisted state', () => {
			const stateIn = SETTINGS_FIXTURE,
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

		it( 'should set [ siteId ].requesting to true when requesting settings', () => {
			const stateIn = REQUESTS_FIXTURE,
				siteId = 12345678,
				action = {
					type: JETPACK_SETTINGS_REQUEST,
					siteId,
				};
			const stateOut = requestsReducer( deepFreeze( stateIn ), action );
			expect( stateOut[ siteId ].requesting ).to.be.true;
		} );

		it( 'should set [ siteId ].requesting to false when successfully requested settings', () => {
			const stateIn = REQUESTS_FIXTURE,
				siteId = 12345678,
				action = {
					type: JETPACK_SETTINGS_REQUEST_SUCCESS,
					siteId,
				};
			const stateOut = requestsReducer( deepFreeze( stateIn ), action );
			expect( stateOut[ siteId ].requesting ).to.be.false;
		} );

		it( 'should set [ siteId ].requesting to false when unable to complete request for settings', () => {
			const stateIn = REQUESTS_FIXTURE,
				siteId = 12345678,
				action = {
					type: JETPACK_SETTINGS_REQUEST_FAILURE,
					siteId,
				};
			const stateOut = requestsReducer( deepFreeze( stateIn ), action );
			expect( stateOut[ siteId ].requesting ).to.be.false;
		} );

		it( 'should set [ siteId ].updating to true when updating settings', () => {
			const stateIn = REQUESTS_FIXTURE,
				siteId = 12345678,
				action = {
					type: JETPACK_SETTINGS_UPDATE,
					siteId,
				};
			const stateOut = requestsReducer( deepFreeze( stateIn ), action );
			expect( stateOut[ siteId ].updating ).to.be.true;
		} );

		it( 'should set [ siteId ].updating to false when successfully requested settings', () => {
			const stateIn = REQUESTS_FIXTURE,
				siteId = 12345678,
				action = {
					type: JETPACK_SETTINGS_UPDATE_SUCCESS,
					siteId,
				};
			const stateOut = requestsReducer( deepFreeze( stateIn ), action );
			expect( stateOut[ siteId ].updating ).to.be.false;
		} );

		it( 'should set [ siteId ].updating to false when unable to complete request for settings', () => {
			const stateIn = REQUESTS_FIXTURE,
				siteId = 12345678,
				action = {
					type: JETPACK_SETTINGS_UPDATE_FAILURE,
					siteId,
				};
			const stateOut = requestsReducer( deepFreeze( stateIn ), action );
			expect( stateOut[ siteId ].updating ).to.be.false;
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
} );
