/**
 * External dependencies
 */
import { expect } from 'chai';
import deepFreeze from 'deep-freeze';

/**
 * Internal dependencies
 */
import reducer from '../reducer';
import {
	SERIALIZE,
	DESERIALIZE,
	PUSH_NOTIFICATIONS_RECEIVE_REGISTER_DEVICE,
} from 'calypso/state/action-types';

const wpcomSubscription = {
	ID: '42',
	settings: {
		comments: {
			desc: 'Comments',
			long_desc: '"Someone comments one of my posts"',
			value: '1',
		},
	},
};

describe( 'system reducer', () => {
	test( 'should persist keys', () => {
		const previousState = { system: { wpcomSubscription: wpcomSubscription } };
		deepFreeze( previousState );
		const action = { type: SERIALIZE };
		const newState = reducer( previousState, action ).root();

		expect( newState.system ).to.eql( { wpcomSubscription } );
	} );

	test( 'should refuse to persist particular keys', () => {
		const previousState = {
			system: {
				apiReady: true,
				authorized: true,
				authorizationLoaded: true,
				blocked: false,
				wpcomSubscription: wpcomSubscription,
			},
		};
		deepFreeze( previousState );
		const action = { type: SERIALIZE };
		const newState = reducer( previousState, action ).root();

		expect( newState.system ).to.eql( { wpcomSubscription } );
	} );

	test( 'should restore keys', () => {
		const previousState = { system: { wpcomSubscription: wpcomSubscription } };
		deepFreeze( previousState );
		const action = { type: DESERIALIZE };
		const newState = reducer( previousState, action );

		expect( newState.system ).to.eql( {
			wpcomSubscription,
		} );
	} );

	test( 'should refuse to restore particular keys', () => {
		const wpcomSubscriptionId = { ID: '42' };
		const previousState = {
			system: {
				apiReady: true,
				authorized: true,
				authorizationLoaded: true,
				blocked: false,
				wpcomSubscription: wpcomSubscriptionId,
			},
		};
		deepFreeze( previousState );
		const action = { type: DESERIALIZE };
		const newState = reducer( previousState, action );

		expect( newState.system ).to.eql( {
			wpcomSubscription: wpcomSubscriptionId,
		} );
	} );

	test( 'should accept an integer for wpcomSubscription ID and store it as string', () => {
		const action = {
			type: PUSH_NOTIFICATIONS_RECEIVE_REGISTER_DEVICE,
			data: {
				ID: parseInt( wpcomSubscription.ID ),
				settings: wpcomSubscription.settings,
			},
		};
		const newState = reducer( {}, action );

		expect( newState.system ).to.eql( { wpcomSubscription } );
	} );
} );

describe( 'settings reducer', () => {
	test( 'should persist keys', () => {
		const previousState = {
			settings: {
				enabled: false,
				dismissedNotice: true,
				dismissedNoticeAt: 1466067124796,
			},
		};
		deepFreeze( previousState );
		const action = { type: SERIALIZE };
		const newState = reducer( previousState, action ).root();

		expect( newState.settings ).to.eql( {
			dismissedNotice: true,
			dismissedNoticeAt: 1466067124796,
			enabled: false,
		} );
	} );

	test( 'should refuse to persist particular keys', () => {
		const previousState = {
			settings: {
				enabled: true,
				showingUnblockInstructions: true,
			},
		};
		deepFreeze( previousState );
		const action = { type: SERIALIZE };
		const newState = reducer( previousState, action ).root();

		expect( newState.settings ).to.eql( {
			enabled: true,
		} );
	} );

	test( 'should restore keys', () => {
		const previousState = {
			settings: {
				enabled: false,
				dismissedNotice: true,
				dismissedNoticeAt: 1466067124796,
			},
		};
		deepFreeze( previousState );
		const newState = reducer( previousState, { type: DESERIALIZE } );

		expect( newState.settings ).to.eql( {
			dismissedNotice: true,
			dismissedNoticeAt: 1466067124796,
			enabled: false,
		} );
	} );

	test( 'should refuse to restore particular keys', () => {
		const previousState = {
			settings: {
				enabled: true,
				showingUnblockInstructions: true,
			},
		};
		deepFreeze( previousState );
		const action = { type: DESERIALIZE };
		const newState = reducer( previousState, action );

		expect( newState.settings ).to.eql( {
			enabled: true,
		} );
	} );
} );
