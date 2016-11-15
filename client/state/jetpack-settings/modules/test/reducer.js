/**
 * External dependencies
 */
import { expect } from 'chai';
import deepFreeze from 'deep-freeze';

/**
 * Internal dependencies
 */
import {
	JETPACK_MODULE_ACTIVATE,
	JETPACK_MODULE_ACTIVATE_FAILURE,
	JETPACK_MODULE_ACTIVATE_SUCCESS
} from 'state/action-types';
import {
	items as itemsReducer,
	requests as requestsReducer
} from '../reducer';

import {
	modules as MODULES_FIXTURE,
	requests as REQUESTS_FIXTURE
} from './fixture';

describe( 'reducer', () => {
	describe( 'items', () => {
		it( 'state should default to empty object', () => {
			const state = itemsReducer( undefined, {} );
			expect( state ).to.eql( {} );
		} );

		describe( '#moduleActivation', () => {
			it( 'should activate a module', () => {
				const stateIn = MODULES_FIXTURE,
					siteId = 123456,
					action = {
						type: JETPACK_MODULE_ACTIVATE_SUCCESS,
						siteId,
						moduleSlug: 'module-a'
					};
				const stateOut = itemsReducer( deepFreeze( stateIn ), action );
				expect( stateOut[ siteId ][ 'module-a' ].active ).to.be.true;
			} );
		} );
	} );

	describe( 'requests', () => {
		it( 'state should default to initialState', () => {
			const state = requestsReducer( undefined, {} );
			expect( state ).to.eql( {} );
		} );

		describe( '#moduleActivation', () => {
			it( 'should set [ siteId ][ moduleSlug ].activating to true when activating a module', () => {
				const stateIn = REQUESTS_FIXTURE,
					siteId = 123456,
					action = {
						type: JETPACK_MODULE_ACTIVATE,
						siteId,
						moduleSlug: 'moduleSlug'
					};
				const stateOut = requestsReducer( deepFreeze( stateIn ), action );
				expect( stateOut[ siteId ][ action.moduleSlug ].activating ).to.be.true;
			} );

			it( 'should set [ siteId ][ moduleSlug ].activating to false when module has been activated', () => {
				const stateIn = REQUESTS_FIXTURE,
					siteId = 123456,
					action = {
						type: JETPACK_MODULE_ACTIVATE_SUCCESS,
						siteId,
						moduleSlug: 'moduleSlug'
					};
				const stateOut = requestsReducer( deepFreeze( stateIn ), action );
				expect( stateOut[ siteId ][ action.moduleSlug ].activating ).to.be.false;
			} );

			it( 'should set [ siteId ][ moduleSlug ].activating to false when activating a module fails', () => {
				const stateIn = REQUESTS_FIXTURE,
					siteId = 123456,
					action = {
						type: JETPACK_MODULE_ACTIVATE_FAILURE,
						siteId,
						moduleSlug: 'moduleSlug'
					};
				const stateOut = requestsReducer( deepFreeze( stateIn ), action );
				expect( stateOut[ siteId ][ action.moduleSlug ].activating ).to.be.false;
			} );
		} );
	} );
} );
