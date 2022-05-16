import deepFreeze from 'deep-freeze';
import {
	KEYRING_SERVICES_RECEIVE,
	KEYRING_SERVICES_REQUEST,
	KEYRING_SERVICES_REQUEST_FAILURE,
	KEYRING_SERVICES_REQUEST_SUCCESS,
} from 'calypso/state/action-types';
import { serialize, deserialize } from 'calypso/state/utils';
import { useSandbox } from 'calypso/test-helpers/use-sinon';
import reducer, { items, isFetching } from '../reducer';

const originalKeyringServices = {
	facebook: {
		ID: 'facebook',
		connect_URL: 'https://public-api.wordpress.com/connect/',
		description: 'Publish your posts to your Facebook timeline or page.',
		genericon: {
			class: 'facebook-alt', // eslint-disable-line quote-props
			unicode: '\f203',
		},
		icon: 'http://i.wordpress.com/wp-content/admin-plugins/publicize/assets/publicize-fb-2x.png',
		jetpack_module_required: 'publicize',
		jetpack_support: true,
		label: 'Facebook',
		multiple_external_user_ID_support: true,
		external_users_only: true,
		type: 'publicize',
	},
	twitter: {
		ID: 'twitter',
		connect_URL: 'https://public-api.wordpress.com/connect/',
		description: 'Publish your posts to your Twitter account.',
		genericon: {
			class: 'twitter', // eslint-disable-line quote-props
			unicode: '\f202',
		},
		icon: 'http://i.wordpress.com/wp-content/admin-plugins/publicize/assets/publicize-twitter-2x.png',
		jetpack_module_required: 'publicize',
		jetpack_support: true,
		label: 'Twitter',
		multiple_external_user_ID_support: false,
		external_users_only: false,
		type: 'publicize',
	},
};

describe( 'reducer', () => {
	useSandbox( ( sandbox ) => sandbox.stub( console, 'warn' ) );

	test( 'should include expected keys in return value', () => {
		expect( Object.keys( reducer( undefined, {} ) ) ).toEqual(
			expect.arrayContaining( [ 'items', 'isFetching' ] )
		);
	} );

	describe( '#statesList()', () => {
		test( 'should default to empty object', () => {
			const state = items( undefined, {} );

			expect( state ).toEqual( {} );
		} );

		test( 'should store the states list received', () => {
			const state = items(
				{},
				{
					type: KEYRING_SERVICES_RECEIVE,
					services: originalKeyringServices,
				}
			);

			expect( state ).toEqual( originalKeyringServices );
		} );

		describe( 'persistence', () => {
			test( 'persists state', () => {
				const original = deepFreeze( originalKeyringServices );
				const services = serialize( items, original );

				expect( services ).toEqual( original );
			} );

			test( 'loads valid persisted state', () => {
				const original = deepFreeze( originalKeyringServices );
				const services = deserialize( items, original );

				expect( services ).toEqual( original );
			} );

			test( 'loads default state when schema does not match', () => {
				const original = deepFreeze( [ { ID: 'facebook' }, { ID: 'twitter' } ] );
				const services = deserialize( items, original );

				expect( services ).toEqual( {} );
			} );
		} );
	} );

	describe( '#isFetching()', () => {
		test( 'should default to false', () => {
			const state = isFetching( undefined, {} );

			expect( state ).toEqual( false );
		} );

		test( 'should be true after a request begins', () => {
			const state = isFetching( false, {
				type: KEYRING_SERVICES_REQUEST,
			} );
			expect( state ).toEqual( true );
		} );

		test( 'should be false when a request completes', () => {
			const state = isFetching( true, {
				type: KEYRING_SERVICES_REQUEST_SUCCESS,
			} );
			expect( state ).toEqual( false );
		} );

		test( 'should be false when a request fails', () => {
			const state = isFetching( true, {
				type: KEYRING_SERVICES_REQUEST_FAILURE,
			} );
			expect( state ).toEqual( false );
		} );
	} );
} );
