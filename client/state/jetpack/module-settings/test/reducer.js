/**
 * External dependencies
 */
import { expect } from 'chai';
import deepFreeze from 'deep-freeze';

/**
 * Internal dependencies
 */
import {
	JETPACK_MODULE_SETTINGS_RECEIVE,
	JETPACK_MODULE_SETTINGS_REQUEST,
	JETPACK_MODULE_SETTINGS_REQUEST_FAILURE,
	JETPACK_MODULE_SETTINGS_REQUEST_SUCCESS,
	JETPACK_MODULE_SETTINGS_UPDATE,
	JETPACK_MODULE_SETTINGS_UPDATE_SUCCESS,
	JETPACK_MODULE_SETTINGS_UPDATE_FAILURE,
	SERIALIZE,
	DESERIALIZE
} from 'state/action-types';
import {
	items as itemsReducer,
	requests as requestsReducer
} from '../reducer';

import {
	moduleSettings as MODULE_SETTINGS_FIXTURE,
	requests as REQUESTS_FIXTURE
} from './fixture';

describe( 'reducer', () => {
	describe( 'items', () => {
		it( 'state should default to empty object', () => {
			const state = itemsReducer( undefined, {} );
			expect( state ).to.eql( {} );
		} );

		it( 'should store new module settings in the items object', () => {
			const stateIn = {},
				siteId = 12345678,
				moduleSlug = 'module-a',
				action = {
					type: JETPACK_MODULE_SETTINGS_RECEIVE,
					siteId,
					moduleSlug,
					settings: MODULE_SETTINGS_FIXTURE[ moduleSlug ]
				};
			const stateOut = itemsReducer( deepFreeze( stateIn ), action );
			expect( stateOut ).to.eql( {
				12345678: {
					'module-a': MODULE_SETTINGS_FIXTURE[ moduleSlug ]
				}
			} );
		} );

		it( 'should store new module settings to the items object for the right site', () => {
			const siteId = 87654321,
				moduleSlug = 'module-a',
				otherModuleSlug = 'module-b',
				stateIn = {
					12345678: {
						'module-a': MODULE_SETTINGS_FIXTURE[ moduleSlug ]
					}
				},
				action = {
					type: JETPACK_MODULE_SETTINGS_RECEIVE,
					siteId,
					moduleSlug,
					settings: MODULE_SETTINGS_FIXTURE[ otherModuleSlug ]
				};
			const stateOut = itemsReducer( deepFreeze( stateIn ), action );
			expect( stateOut ).to.eql( {
				12345678: {
					'module-a': MODULE_SETTINGS_FIXTURE[ moduleSlug ]
				},
				87654321: {
					'module-a': MODULE_SETTINGS_FIXTURE[ otherModuleSlug ]
				}
			} );
		} );

		it( 'should accumulate new module settings to the items object for the right site', () => {
			const siteId = 12345678,
				moduleSlug = 'module-a',
				otherModuleSlug = 'module-b',
				stateIn = {
					12345678: {
						'module-a': MODULE_SETTINGS_FIXTURE[ moduleSlug ]
					},
					87654321: {
						'module-a': MODULE_SETTINGS_FIXTURE[ otherModuleSlug ]
					}
				},
				action = {
					type: JETPACK_MODULE_SETTINGS_RECEIVE,
					siteId,
					moduleSlug: otherModuleSlug,
					settings: MODULE_SETTINGS_FIXTURE[ otherModuleSlug ]
				};
			const stateOut = itemsReducer( deepFreeze( stateIn ), action );
			expect( stateOut ).to.eql( {
				12345678: {
					'module-a': MODULE_SETTINGS_FIXTURE[ moduleSlug ],
					'module-b': MODULE_SETTINGS_FIXTURE[ otherModuleSlug ]
				},
				87654321: {
					'module-a': MODULE_SETTINGS_FIXTURE[ otherModuleSlug ]
				}
			} );
		} );

		it( 'should update module settings in the items object', () => {
			const siteId = 12345678,
				moduleSlug = 'module-a',
				otherModuleSlug = 'module-b',
				stateIn = {
					12345678: {
						'module-a': MODULE_SETTINGS_FIXTURE[ moduleSlug ]
					}
				},
				action = {
					type: JETPACK_MODULE_SETTINGS_RECEIVE,
					siteId,
					moduleSlug,
					settings: MODULE_SETTINGS_FIXTURE[ otherModuleSlug ]
				};
			const stateOut = itemsReducer( deepFreeze( stateIn ), action );
			expect( stateOut ).to.eql( {
				12345678: {
					'module-a': MODULE_SETTINGS_FIXTURE[ otherModuleSlug ]
				}
			} );
		} );

		it( 'should not persist state', () => {
			const stateIn = MODULE_SETTINGS_FIXTURE,
				action = {
					type: SERIALIZE
				};
			const stateOut = itemsReducer( deepFreeze( stateIn ), action );
			expect( stateOut ).to.eql( {} );
		} );

		it( 'should not load persisted state', () => {
			const stateIn = MODULE_SETTINGS_FIXTURE,
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

		it( 'should set [ siteId ][ moduleSlug ].requesting to true when requesting module settings', () => {
			const stateIn = REQUESTS_FIXTURE,
				siteId = 12345678,
				action = {
					type: JETPACK_MODULE_SETTINGS_REQUEST,
					siteId,
					moduleSlug: 'moduleSlug'
				};
			const stateOut = requestsReducer( deepFreeze( stateIn ), action );
			expect( stateOut[ siteId ][ action.moduleSlug ].requesting ).to.be.true;
		} );

		it( 'should set [ siteId ][ moduleSlug ].requesting to false when successfully requested module settings', () => {
			const stateIn = REQUESTS_FIXTURE,
				siteId = 12345678,
				action = {
					type: JETPACK_MODULE_SETTINGS_REQUEST_SUCCESS,
					siteId,
					moduleSlug: 'moduleSlug'
				};
			const stateOut = requestsReducer( deepFreeze( stateIn ), action );
			expect( stateOut[ siteId ][ action.moduleSlug ].requesting ).to.be.false;
		} );

		it( 'should set [ siteId ][ moduleSlug ].requesting to false when unable to complete request for module settings', () => {
			const stateIn = REQUESTS_FIXTURE,
				siteId = 12345678,
				action = {
					type: JETPACK_MODULE_SETTINGS_REQUEST_FAILURE,
					siteId,
					moduleSlug: 'moduleSlug'
				};
			const stateOut = requestsReducer( deepFreeze( stateIn ), action );
			expect( stateOut[ siteId ][ action.moduleSlug ].requesting ).to.be.false;
		} );

		it( 'should set [ siteId ][ moduleSlug ].updating to true when updating module settings', () => {
			const stateIn = REQUESTS_FIXTURE,
				siteId = 12345678,
				action = {
					type: JETPACK_MODULE_SETTINGS_UPDATE,
					siteId,
					moduleSlug: 'moduleSlug'
				};
			const stateOut = requestsReducer( deepFreeze( stateIn ), action );
			expect( stateOut[ siteId ][ action.moduleSlug ].updating ).to.be.true;
		} );

		it( 'should set [ siteId ][ moduleSlug ].updating to false when successfully requested module settings', () => {
			const stateIn = REQUESTS_FIXTURE,
				siteId = 12345678,
				action = {
					type: JETPACK_MODULE_SETTINGS_UPDATE_SUCCESS,
					siteId,
					moduleSlug: 'moduleSlug'
				};
			const stateOut = requestsReducer( deepFreeze( stateIn ), action );
			expect( stateOut[ siteId ][ action.moduleSlug ].updating ).to.be.false;
		} );

		it( 'should set [ siteId ][ moduleSlug ].updating to false when unable to complete request for module settings', () => {
			const stateIn = REQUESTS_FIXTURE,
				siteId = 12345678,
				action = {
					type: JETPACK_MODULE_SETTINGS_UPDATE_FAILURE,
					siteId,
					moduleSlug: 'moduleSlug'
				};
			const stateOut = requestsReducer( deepFreeze( stateIn ), action );
			expect( stateOut[ siteId ][ action.moduleSlug ].updating ).to.be.false;
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
