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

const wpcomSubscription = {
	ID: 42,
	lastUpdated: '2016-06-16T14:41:09+02:00',
	settings: {
		comments: {
			desc: 'Comments',
			long_desc: '"Someone comments one of my posts"',
			value: '1' }
	}
};

describe( 'system reducer', () => {

	it( 'should persist keys', () => {
		const state = reducer( {
			system: {
				wpcomSubscription: wpcomSubscription,
			}
		}, { type: SERIALIZE } );

		expect( state.system ).to.eql( {
			wpcomSubscription,
		} );
	} );

	it( 'should refuse to persist particular keys', () => {
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

	it( 'should restore keys', () => {
		const state = reducer( {
			system: {
				wpcomSubscription: wpcomSubscription,
			}
		}, { type: DESERIALIZE } );

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

	it( 'should persist keys', () => {
		const state = reducer( {
			settings: {
				enabled: false,
				dismissedNotice: true,
				dismissedNoticeAt: 1466067124796,
			}
		}, { type: SERIALIZE } );

		expect( state.settings ).to.eql( {
			dismissedNotice: true,
			dismissedNoticeAt: 1466067124796,
			enabled: false,
		} );
	} );

	it( 'should refuse to persist particular keys', () => {
		const state = reducer( {
			settings: {
				enabled: true,
				showingUnblockInstructions: true,
			}
		}, { type: SERIALIZE } );

		expect( state.settings ).to.eql( {
			enabled: true,
		} );
	} );

	it( 'should restore keys', () => {
		const state = reducer( {
			settings: {
				enabled: false,
				dismissedNotice: true,
				dismissedNoticeAt: 1466067124796,
			}
		}, { type: DESERIALIZE } );

		expect( state.settings ).to.eql( {
			dismissedNotice: true,
			dismissedNoticeAt: 1466067124796,
			enabled: false,
		} );
	} );

	it( 'should refuse to restore particular keys', () => {
		const state = reducer( {
			settings: {
				enabled: true,
				showingUnblockInstructions: true,
			}
		}, { type: DESERIALIZE } );

		expect( state.settings ).to.eql( {
			enabled: true,
		} );
	} );
} );
