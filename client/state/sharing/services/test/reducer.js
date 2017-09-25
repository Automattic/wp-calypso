/**
 * External dependencies
 */
import { expect } from 'chai';
import deepFreeze from 'deep-freeze';

/**
 * Internal dependencies
 */
import reducer, { items, isFetching } from '../reducer';
import { KEYRING_SERVICES_RECEIVE, KEYRING_SERVICES_REQUEST, KEYRING_SERVICES_REQUEST_FAILURE, KEYRING_SERVICES_REQUEST_SUCCESS, DESERIALIZE, SERIALIZE } from 'state/action-types';
import { useSandbox } from 'test/helpers/use-sinon';

const originalKeyringServices = {
	facebook: {
		ID: 'facebook',
		connect_URL: 'https://public-api.wordpress.com/connect/',
		description: 'Publish your posts to your Facebook timeline or page.',
		genericon: {
			class: 'facebook-alt', // eslint-disable-line quote-props
			unicode: '\f203'
		},
		icon: 'http://i.wordpress.com/wp-content/admin-plugins/publicize/assets/publicize-fb-2x.png',
		jetpack_module_required: 'publicize',
		jetpack_support: true,
		label: 'Facebook',
		multiple_external_user_ID_support: true,
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
		type: 'publicize',
	},
};

describe( 'reducer', () => {
	useSandbox( ( sandbox ) => sandbox.stub( console, 'warn' ) );

	it( 'should include expected keys in return value', () => {
		expect( reducer( undefined, {} ) ).to.have.keys( [
			'items',
			'isFetching'
		] );
	} );

	describe( '#statesList()', () => {
		it( 'should default to empty object', () => {
			const state = items( undefined, {} );

			expect( state ).to.eql( {} );
		} );

		it( 'should store the states list received', () => {
			const state = items( {}, {
				type: KEYRING_SERVICES_RECEIVE,
				services: originalKeyringServices
			} );

			expect( state ).to.eql( originalKeyringServices );
		} );

		describe( 'persistence', () => {
			it( 'persists state', () => {
				const original = deepFreeze( originalKeyringServices ),
					services = items( original, { type: SERIALIZE } );

				expect( services ).to.eql( original );
			} );

			it( 'loads valid persisted state', () => {
				const original = deepFreeze( originalKeyringServices ),
					services = items( original, { type: DESERIALIZE } );

				expect( services ).to.eql( original );
			} );

			it( 'loads default state when schema does not match', () => {
				const original = deepFreeze( [
					{ ID: 'facebook' },
					{ ID: 'twitter' },
				] );
				const services = items( original, { type: DESERIALIZE } );

				expect( services ).to.eql( {} );
			} );
		} );
	} );

	describe( '#isFetching()', () => {
		it( 'should default to false', () => {
			const state = isFetching( undefined, {} );

			expect( state ).to.eql( false );
		} );

		it( 'should be true after a request begins', () => {
			const state = isFetching( false, {
				type: KEYRING_SERVICES_REQUEST,
			} );
			expect( state ).to.eql( true );
		} );

		it( 'should be false when a request completes', () => {
			const state = isFetching( true, {
				type: KEYRING_SERVICES_REQUEST_SUCCESS,
			} );
			expect( state ).to.eql( false );
		} );

		it( 'should be false when a request fails', () => {
			const state = isFetching( true, {
				type: KEYRING_SERVICES_REQUEST_FAILURE,
			} );
			expect( state ).to.eql( false );
		} );

		it( 'should never persist state', () => {
			const state = isFetching( true, { type: SERIALIZE } );

			expect( state ).to.eql( false );
		} );

		it( 'should never load persisted state', () => {
			const state = isFetching( true, { type: DESERIALIZE } );

			expect( state ).to.eql( false );
		} );
	} );
} );
