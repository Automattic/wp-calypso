/**
 * External dependencies
 */
import { expect } from 'chai';
import deepFreeze from 'deep-freeze';

/**
 * Internal dependencies
 */
import {
	SERIALIZE,
	DESERIALIZE
} from 'state/action-types';
import reducer, {} from '../reducer';

const wpcomSubscription = {
	ID: '42',
	lastUpdated: '2016-06-16T14:41:09+02:00',
	settings: {
		comments: {
			desc: 'Comments',
			long_desc: '"Someone comments one of my posts"',
			value: '1'
		}
	}
};

describe( 'system reducer', () => {
	it( 'should persist keys', () => {
		const previousState = { system: { wpcomSubscription: wpcomSubscription } };
		deepFreeze( previousState );
		const action = { type: SERIALIZE };
		const newState = reducer( previousState, action );

		expect( newState.system ).to.eql( { wpcomSubscription } );
	} );

	it( 'should refuse to persist particular keys', () => {
		const previousState = {
			system: {
				apiReady: true,
				authorized: true,
				authorizationLoaded: true,
				blocked: false,
				wpcomSubscription: wpcomSubscription,
			}
		};
		deepFreeze( previousState );
		const action = { type: SERIALIZE };
		const newState = reducer( previousState, action );

		expect( newState.system ).to.eql( { wpcomSubscription } );
	} );

	it( 'should restore keys', () => {
		const previousState = { system: { wpcomSubscription: wpcomSubscription } };
		deepFreeze( previousState );
		const action = { type: DESERIALIZE };
		const newState = reducer( previousState, action );

		expect( newState.system ).to.eql( {
			wpcomSubscription,
		} );
	} );

	it( 'should refuse to restore particular keys', () => {
		const wpcomSubscriptionId = { ID: '42' };
		const previousState = {
			system: {
				apiReady: true,
				authorized: true,
				authorizationLoaded: true,
				blocked: false,
				wpcomSubscription: wpcomSubscriptionId,
			}
		};
		deepFreeze( previousState );
		const action = { type: DESERIALIZE };
		const newState = reducer( previousState, action );

		expect( newState.system ).to.eql( {
			wpcomSubscription: wpcomSubscriptionId,
		} );
	} );
} );

describe( 'settings reducer', () => {
	it( 'should persist keys', () => {
		const previousState = {
			settings: {
				enabled: false,
				dismissedNotice: true,
				dismissedNoticeAt: 1466067124796,
			}
		};
		deepFreeze( previousState );
		const action = { type: SERIALIZE };
		const newState = reducer( previousState, action );

		expect( newState.settings ).to.eql( {
			dismissedNotice: true,
			dismissedNoticeAt: 1466067124796,
			enabled: false,
		} );
	} );

	it( 'should refuse to persist particular keys', () => {
		const previousState = {
			settings: {
				enabled: true,
				showingUnblockInstructions: true,
			}
		};
		deepFreeze( previousState );
		const action = { type: SERIALIZE };
		const newState = reducer( previousState, action );

		expect( newState.settings ).to.eql( {
			enabled: true,
		} );
	} );

	it( 'should restore keys', () => {
		const previousState = {
			settings: {
				enabled: false,
				dismissedNotice: true,
				dismissedNoticeAt: 1466067124796,
			}
		};
		deepFreeze( previousState );
		const newState = reducer( previousState, { type: DESERIALIZE } );

		expect( newState.settings ).to.eql( {
			dismissedNotice: true,
			dismissedNoticeAt: 1466067124796,
			enabled: false,
		} );
	} );

	it( 'should refuse to restore particular keys', () => {
		const previousState = {
			settings: {
				enabled: true,
				showingUnblockInstructions: true,
			}
		};
		deepFreeze( previousState );
		const action = { type: DESERIALIZE };
		const newState = reducer( previousState, action );

		expect( newState.settings ).to.eql( {
			enabled: true,
		} );
	} );
} );
