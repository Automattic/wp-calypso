import deepFreeze from 'deep-freeze';
import { PUSH_NOTIFICATIONS_RECEIVE_REGISTER_DEVICE } from 'calypso/state/action-types';
import { serialize, deserialize } from 'calypso/state/utils';
import reducer from '../reducer';

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
		const previousState = { system: { wpcomSubscription } };
		deepFreeze( previousState );
		const newState = serialize( reducer, previousState ).root();

		expect( newState.system ).toStrictEqual( { wpcomSubscription } );
	} );

	test( 'should refuse to persist particular keys', () => {
		const previousState = {
			system: {
				apiReady: true,
				blocked: false,
				wpcomSubscription: wpcomSubscription,
			},
		};
		deepFreeze( previousState );
		const newState = serialize( reducer, previousState ).root();

		expect( newState.system ).toStrictEqual( { wpcomSubscription } );
	} );

	test( 'should restore keys', () => {
		const previousState = { system: { wpcomSubscription } };
		deepFreeze( previousState );
		const newState = deserialize( reducer, previousState );

		expect( newState.system ).toStrictEqual( {
			wpcomSubscription,
		} );
	} );

	test( 'should refuse to restore particular keys', () => {
		const wpcomSubscriptionId = { ID: '42' };
		const previousState = {
			system: {
				apiReady: true,
				blocked: false,
				wpcomSubscription: wpcomSubscriptionId,
			},
		};
		deepFreeze( previousState );
		const newState = deserialize( reducer, previousState );

		expect( newState.system ).toStrictEqual( {
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

		expect( newState.system ).toStrictEqual( { wpcomSubscription } );
	} );
} );

describe( 'settings reducer', () => {
	test( 'should persist keys', () => {
		const previousState = {
			settings: {
				enabled: false,
			},
		};
		deepFreeze( previousState );
		const newState = serialize( reducer, previousState ).root();

		expect( newState.settings ).toStrictEqual( {
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
		const newState = serialize( reducer, previousState ).root();

		expect( newState.settings ).toStrictEqual( {
			enabled: true,
		} );
	} );

	test( 'should restore keys', () => {
		const previousState = {
			settings: {
				enabled: false,
			},
		};
		deepFreeze( previousState );
		const newState = deserialize( reducer, previousState );

		expect( newState.settings ).toStrictEqual( {
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
		const newState = deserialize( reducer, previousState );

		expect( newState.settings ).toStrictEqual( {
			enabled: true,
		} );
	} );
} );
