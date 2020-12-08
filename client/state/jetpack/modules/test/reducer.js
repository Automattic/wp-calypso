/**
 * External dependencies
 */
import { expect } from 'chai';
import deepFreeze from 'deep-freeze';

/**
 * Internal dependencies
 */
import { items as itemsReducer, requests as requestsReducer } from '../reducer';
import { modules as MODULES_FIXTURE, requests as REQUESTS_FIXTURE } from './fixture';
import {
	JETPACK_MODULE_ACTIVATE,
	JETPACK_MODULE_ACTIVATE_FAILURE,
	JETPACK_MODULE_ACTIVATE_SUCCESS,
	JETPACK_MODULE_DEACTIVATE,
	JETPACK_MODULE_DEACTIVATE_FAILURE,
	JETPACK_MODULE_DEACTIVATE_SUCCESS,
	JETPACK_MODULES_RECEIVE,
	JETPACK_MODULES_REQUEST,
	JETPACK_MODULES_REQUEST_FAILURE,
	JETPACK_MODULES_REQUEST_SUCCESS,
	JETPACK_SETTINGS_UPDATE,
	JETPACK_SETTINGS_SAVE_SUCCESS,
	SERIALIZE,
	DESERIALIZE,
} from 'calypso/state/action-types';

describe( 'reducer', () => {
	describe( 'items', () => {
		test( 'state should default to empty object', () => {
			const state = itemsReducer( undefined, {} );
			expect( state ).to.eql( {} );
		} );

		test( 'should activate a module', () => {
			const stateIn = MODULES_FIXTURE;
			const siteId = 123456;
			const action = {
				type: JETPACK_MODULE_ACTIVATE_SUCCESS,
				siteId,
				moduleSlug: 'module-a',
			};
			const stateOut = itemsReducer( deepFreeze( stateIn ), action );
			expect( stateOut[ siteId ][ 'module-a' ].active ).to.be.true;
		} );

		test( 'should deactivate a module', () => {
			const stateIn = MODULES_FIXTURE;
			const siteId = 123456;
			const action = {
				type: JETPACK_MODULE_DEACTIVATE_SUCCESS,
				siteId,
				moduleSlug: 'module-b',
			};
			const stateOut = itemsReducer( deepFreeze( stateIn ), action );
			expect( stateOut[ siteId ][ 'module-b' ].active ).to.be.false;
		} );

		test( 'should not persist state', () => {
			const stateIn = MODULES_FIXTURE;
			const action = {
				type: SERIALIZE,
			};
			const stateOut = itemsReducer( deepFreeze( stateIn ), action );
			expect( stateOut ).to.be.undefined;
		} );

		test( 'should not load persisted state', () => {
			const stateIn = MODULES_FIXTURE;
			const action = {
				type: DESERIALIZE,
			};
			const stateOut = itemsReducer( deepFreeze( stateIn ), action );
			expect( stateOut ).to.eql( {} );
		} );

		test( 'should replace the items object for the site with a new list of modules', () => {
			const stateIn = MODULES_FIXTURE;
			const siteId = 123456;
			const action = {
				type: JETPACK_MODULES_RECEIVE,
				siteId,
				modules: MODULES_FIXTURE[ siteId ],
			};
			const stateOut = itemsReducer( deepFreeze( stateIn ), action );
			expect( stateOut[ siteId ] ).to.eql( MODULES_FIXTURE[ siteId ] );
		} );

		test( 'should update modules activation state when updating settings', () => {
			const siteId = 123456;
			const stateIn = {
				123456: {
					'related-posts': {
						module: 'related-posts',
						active: false,
					},
					'infinite-scroll': {
						module: 'infinite-scroll',
						active: true,
					},
				},
			};
			const action = {
				type: JETPACK_SETTINGS_SAVE_SUCCESS,
				siteId,
				settings: {
					'related-posts': true,
					'infinite-scroll': false,
				},
			};
			const stateOut = itemsReducer( deepFreeze( stateIn ), action );
			expect( stateOut[ siteId ] ).to.eql( {
				'related-posts': {
					module: 'related-posts',
					active: true,
				},
				'infinite-scroll': {
					module: 'infinite-scroll',
					active: false,
				},
			} );
		} );

		test( 'should update modules activation state when receiving new settings', () => {
			const siteId = 123456;
			const stateIn = {
				123456: {
					'related-posts': {
						module: 'related-posts',
						active: false,
					},
					'infinite-scroll': {
						module: 'infinite-scroll',
						active: true,
					},
				},
			};
			const action = {
				type: JETPACK_SETTINGS_UPDATE,
				siteId,
				settings: {
					'related-posts': true,
					'infinite-scroll': false,
				},
			};
			const stateOut = itemsReducer( deepFreeze( stateIn ), action );
			expect( stateOut[ siteId ] ).to.eql( {
				'related-posts': {
					module: 'related-posts',
					active: true,
				},
				'infinite-scroll': {
					module: 'infinite-scroll',
					active: false,
				},
			} );
		} );
	} );

	describe( 'requests', () => {
		test( 'state should default to initialState', () => {
			const state = requestsReducer( undefined, {} );
			expect( state ).to.eql( {} );
		} );

		describe( '#moduleActivation', () => {
			test( 'should set [ siteId ][ moduleSlug ].activating to true when activating a module', () => {
				const stateIn = REQUESTS_FIXTURE;
				const siteId = 123456;
				const action = {
					type: JETPACK_MODULE_ACTIVATE,
					siteId,
					moduleSlug: 'moduleSlug',
				};
				const stateOut = requestsReducer( deepFreeze( stateIn ), action );
				expect( stateOut[ siteId ][ action.moduleSlug ].activating ).to.be.true;
			} );

			test( 'should set [ siteId ][ moduleSlug ].activating to false when module has been activated', () => {
				const stateIn = REQUESTS_FIXTURE;
				const siteId = 123456;
				const action = {
					type: JETPACK_MODULE_ACTIVATE_SUCCESS,
					siteId,
					moduleSlug: 'moduleSlug',
				};
				const stateOut = requestsReducer( deepFreeze( stateIn ), action );
				expect( stateOut[ siteId ][ action.moduleSlug ].activating ).to.be.false;
			} );

			test( 'should set [ siteId ][ moduleSlug ].activating to false when activating a module fails', () => {
				const stateIn = REQUESTS_FIXTURE;
				const siteId = 123456;
				const action = {
					type: JETPACK_MODULE_ACTIVATE_FAILURE,
					siteId,
					moduleSlug: 'moduleSlug',
				};
				const stateOut = requestsReducer( deepFreeze( stateIn ), action );
				expect( stateOut[ siteId ][ action.moduleSlug ].activating ).to.be.false;
			} );
		} );

		describe( '#moduleDeactivation', () => {
			test( 'should set [ siteId ][ moduleSlug ].deactivating to true when deactivating a module', () => {
				const stateIn = REQUESTS_FIXTURE;
				const siteId = 123456;
				const action = {
					type: JETPACK_MODULE_DEACTIVATE,
					siteId,
					moduleSlug: 'moduleSlug',
				};
				const stateOut = requestsReducer( deepFreeze( stateIn ), action );
				expect( stateOut[ siteId ][ action.moduleSlug ].deactivating ).to.be.true;
			} );

			test( 'should set [ siteId ][ moduleSlug ].deactivating to false when module has been deactivated', () => {
				const stateIn = REQUESTS_FIXTURE;
				const siteId = 123456;
				const action = {
					type: JETPACK_MODULE_DEACTIVATE_SUCCESS,
					siteId,
					moduleSlug: 'moduleSlug',
				};
				const stateOut = requestsReducer( deepFreeze( stateIn ), action );
				expect( stateOut[ siteId ][ action.moduleSlug ].deactivating ).to.be.false;
			} );

			test( 'should set [ siteId ][ moduleSlug ].deactivating to false when deactivating a module fails', () => {
				const stateIn = REQUESTS_FIXTURE;
				const siteId = 123456;
				const action = {
					type: JETPACK_MODULE_DEACTIVATE_FAILURE,
					siteId,
					moduleSlug: 'moduleSlug',
				};
				const stateOut = requestsReducer( deepFreeze( stateIn ), action );
				expect( stateOut[ siteId ][ action.moduleSlug ].deactivating ).to.be.false;
			} );
		} );

		describe( '#moduleListFetching', () => {
			test( 'should set [ siteId ].fetchingModules to true when requesting the module list', () => {
				const stateIn = REQUESTS_FIXTURE;
				const siteId = 123456;
				const action = {
					type: JETPACK_MODULES_REQUEST,
					siteId,
				};
				const stateOut = requestsReducer( deepFreeze( stateIn ), action );
				expect( stateOut[ siteId ].fetchingModules ).to.be.true;
			} );

			test( 'should set [ siteId ].fetchingModules to false when the module list has been received', () => {
				const stateIn = REQUESTS_FIXTURE;
				const siteId = 123456;
				const action = {
					type: JETPACK_MODULES_REQUEST_SUCCESS,
					siteId,
					modules: {},
				};
				const stateOut = requestsReducer( deepFreeze( stateIn ), action );
				expect( stateOut[ siteId ].fetchingModules ).to.be.false;
			} );

			test( 'should set [ siteId ].fetchingModules to false when requesting the module list fails', () => {
				const stateIn = REQUESTS_FIXTURE;
				const siteId = 123456;
				const action = {
					type: JETPACK_MODULES_REQUEST_FAILURE,
					siteId,
					modules: {},
				};
				const stateOut = requestsReducer( deepFreeze( stateIn ), action );
				expect( stateOut[ siteId ].fetchingModules ).to.be.false;
			} );
		} );

		describe( 'persistence', () => {
			test( 'should not persist state', () => {
				const stateIn = REQUESTS_FIXTURE;
				const action = {
					type: SERIALIZE,
				};
				const stateOut = requestsReducer( deepFreeze( stateIn ), action );
				expect( stateOut ).to.be.undefined;
			} );

			test( 'should not load persisted state', () => {
				const stateIn = REQUESTS_FIXTURE;
				const action = {
					type: DESERIALIZE,
				};
				const stateOut = requestsReducer( deepFreeze( stateIn ), action );
				expect( stateOut ).to.eql( {} );
			} );
		} );
	} );
} );
