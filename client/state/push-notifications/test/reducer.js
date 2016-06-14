/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import {
	SERIALIZE,
	DESERIALIZE
} from 'state/action-types';
import reducer, {} from '../reducer';

describe( 'system reducer', () => {
	it( 'should refuse to persist particular keys', () => {
		const wpcomSubscription = { ID: 42 };
		const state = reducer( {
			system: {
				apiReady: true,
				authorized: true,
				authorizationLoaded: true,
				blocked: false,
				wpcomSubscription: wpcomSubscription,
			}
		}, { type: SERIALIZE } );

		expect( state.system ).to.eql( {
			wpcomSubscription,
		} );
	} );

	it( 'should refuse to restore particular keys', () => {
		const wpcomSubscription = { ID: 42 };
		const state = reducer( {
			system: {
				apiReady: true,
				authorized: true,
				authorizationLoaded: true,
				blocked: false,
				wpcomSubscription: wpcomSubscription,
			}
		}, { type: DESERIALIZE } );

		expect( state.system ).to.eql( {
			wpcomSubscription,
		} );
	} );
} );

describe( 'settings reducer', () => {
	it( 'should refuse to persist particular keys', () => {
		const wpcomSubscription = { ID: 42 };
		const state = reducer( {
			settings: {
				enabled: true,
				showingUnblockInstructions: true,
			},
			system: {
				authorized: true,
				authorizationLoaded: true,
				blocked: true,
				wpcomSubscription: wpcomSubscription,
			},
		}, { type: SERIALIZE } );

		expect( state.settings ).to.eql( {
			enabled: true,
		} );
	} );

	it( 'should refuse to restore particular keys', () => {
		const wpcomSubscription = { ID: 42 };
		const state = reducer( {
			settings: {
				enabled: true,
				showingUnblockInstructions: true,
			},
			system: {
				authorized: true,
				authorizationLoaded: true,
				blocked: true,
				wpcomSubscription: wpcomSubscription,
			},
		}, { type: DESERIALIZE } );

		expect( state.settings ).to.eql( {
			enabled: true,
		} );
	} );
} );
