import deepFreeze from 'deep-freeze';
import { CURRENT_USER_RECEIVE, SITE_RECEIVE, SITES_RECEIVE } from 'calypso/state/action-types';
import { serialize, deserialize } from 'calypso/state/utils';
import reducer, { id, capabilities } from '../reducer';

describe( 'reducer', () => {
	jest.spyOn( console, 'warn' ).mockImplementation();

	test( 'should include expected keys in return value', () => {
		expect( Object.keys( reducer( undefined, {} ) ) ).toEqual(
			expect.arrayContaining( [
				'id',
				'user',
				'capabilities',
				'flags',
				'emailVerification',
				'lasagnaJwt',
			] )
		);
	} );

	describe( '#id()', () => {
		test( 'should default to null', () => {
			const state = id( undefined, {} );

			expect( state ).toBeNull();
		} );

		test( 'should set the current user ID', () => {
			const state = id( null, {
				type: CURRENT_USER_RECEIVE,
				user: { ID: 73705554 },
			} );

			expect( state ).toEqual( 73705554 );
		} );

		test( 'should validate ID is positive', () => {
			const state = deserialize( id, -1 );
			expect( state ).toBeNull();
		} );

		test( 'should validate ID is a number', () => {
			const state = deserialize( id, 'foobar' );
			expect( state ).toBeNull();
		} );

		test( 'returns valid ID', () => {
			const state = deserialize( id, 73705554 );
			expect( state ).toEqual( 73705554 );
		} );

		test( 'will SERIALIZE current user', () => {
			const state = serialize( id, 73705554 );
			expect( state ).toEqual( 73705554 );
		} );
	} );

	describe( 'capabilities()', () => {
		test( 'should default to an empty object', () => {
			const state = capabilities( undefined, {} );
			expect( state ).toEqual( {} );
		} );

		test( 'should track capabilities by single received site', () => {
			const state = capabilities( undefined, {
				type: SITE_RECEIVE,
				site: {
					ID: 2916284,
					capabilities: {
						manage_options: false,
					},
				},
			} );

			expect( state ).toEqual( {
				2916284: {
					manage_options: false,
				},
			} );
		} );

		test( 'should accumulate capabilities by received site', () => {
			const original = deepFreeze( {
				2916284: {
					manage_options: false,
				},
			} );
			const state = capabilities( original, {
				type: SITE_RECEIVE,
				site: {
					ID: 77203074,
					capabilities: {
						manage_options: true,
					},
				},
			} );

			expect( state ).toEqual( {
				2916284: {
					manage_options: false,
				},
				77203074: {
					manage_options: true,
				},
			} );
		} );

		test( 'should ignore received site if missing capabilities', () => {
			const state = capabilities( undefined, {
				type: SITE_RECEIVE,
				site: {
					ID: 2916284,
				},
			} );

			expect( state ).toEqual( {} );
		} );

		test( 'should track capabilities by multiple received sites', () => {
			const state = capabilities( undefined, {
				type: SITES_RECEIVE,
				sites: [
					{
						ID: 2916284,
						capabilities: {
							manage_options: false,
						},
					},
				],
			} );

			expect( state ).toEqual( {
				2916284: {
					manage_options: false,
				},
			} );
		} );

		test( 'should ignore received sites if missing capabilities', () => {
			const state = capabilities( undefined, {
				type: SITES_RECEIVE,
				sites: [
					{
						ID: 2916284,
					},
				],
			} );

			expect( state ).toEqual( {} );
		} );

		test( 'should return same state if received sites result in same capabilities', () => {
			const original = deepFreeze( {
				2916284: {
					manage_options: false,
				},
			} );
			const state = capabilities( original, {
				type: SITES_RECEIVE,
				sites: [
					{
						ID: 2916284,
						capabilities: {
							manage_options: false,
						},
					},
				],
			} );

			expect( state ).toEqual( original );
		} );

		test( 'should persist state', () => {
			const original = deepFreeze( {
				2916284: {
					manage_options: false,
				},
			} );
			const state = serialize( capabilities, original );

			expect( state ).toEqual( original );
		} );

		test( 'should restore valid persisted state', () => {
			const original = deepFreeze( {
				2916284: {
					manage_options: false,
				},
			} );
			const state = deserialize( capabilities, original );

			expect( state ).toEqual( original );
		} );

		test( 'should not restore invalid persisted state', () => {
			const original = deepFreeze( {
				BAD2916284: {
					manage_options: false,
				},
			} );
			const state = deserialize( capabilities, original );

			expect( state ).toEqual( {} );
		} );
	} );
} );
