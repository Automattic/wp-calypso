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
	requests as requestsReducer,
	initialRequestsState
} from '../reducer';

import {
	modules as MODULES_FIXTURE,
	requests as REQUESTS_FIXTURE
} from './fixture';

describe( 'items reducer', () => {
	it( 'state should default to empty object', () => {
		const state = itemsReducer( undefined, {} );
		expect( state ).to.eql( {} );
	} );

	describe( '#modulesActivation', () => {
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

describe( 'requests reducer', () => {
	it( 'state should default to initialState', () => {
		const state = requestsReducer( undefined, {} );
		expect( state ).to.equal( initialRequestsState );
	} );

	describe( '#modulesActivation', () => {
		it( 'should set activating[ siteId ][ moduleSlug ] to true when activating a module', () => {
			const stateIn = REQUESTS_FIXTURE,
				siteId = 123456,
				action = {
					type: JETPACK_MODULE_ACTIVATE,
					siteId,
					moduleSlug: 'moduleSlug'
				};
			const stateOut = requestsReducer( deepFreeze( stateIn ), action );
			expect( stateOut.activating[ siteId ][ action.moduleSlug ] ).to.be.true;
		} );

		it( 'should set activating[ siteId ][ moduleSlug ] to false when module has been activated', () => {
			const stateIn = REQUESTS_FIXTURE,
				siteId = 123456,
				action = {
					type: JETPACK_MODULE_ACTIVATE_SUCCESS,
					siteId,
					moduleSlug: 'moduleSlug'
				};
			const stateOut = requestsReducer( deepFreeze( stateIn ), action );
			expect( stateOut.activating[ siteId ][ action.moduleSlug ] ).to.be.false;
		} );

		it( 'should set activating[ siteId ][ moduleSlug ] to false when activating a module fails', () => {
			const stateIn = REQUESTS_FIXTURE,
				siteId = 123456,
				action = {
					type: JETPACK_MODULE_ACTIVATE_FAILURE,
					siteId,
					moduleSlug: 'moduleSlug'
				};
			const stateOut = requestsReducer( deepFreeze( stateIn ), action );
			expect( stateOut.activating[ siteId ][ action.moduleSlug ] ).to.be.false;
		} );
	} );
} );
