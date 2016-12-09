/**
 * External dependencies
 */
import { expect } from 'chai';
import deepFreeze from 'deep-freeze';

/**
 * Internal dependencies
 */
import {
	SITE_ROLES_RECEIVE,
	SITE_ROLES_REQUEST,
	SITE_ROLES_REQUEST_FAILURE,
	SITE_ROLES_REQUEST_SUCCESS,
	SERIALIZE,
	DESERIALIZE
} from 'state/action-types';
import reducer, { requesting, items } from '../reducer';
import { useSandbox } from 'test/helpers/use-sinon';

describe( 'reducer', () => {
	useSandbox( ( sandbox ) => {
		sandbox.stub( console, 'warn' );
	} );

	it( 'should include expected keys in return value', () => {
		expect( reducer( undefined, {} ) ).to.have.keys( [
			'requesting',
			'items'
		] );
	} );

	describe( '#requesting()', () => {
		it( 'should default to an empty object', () => {
			const state = requesting( undefined, {} );

			expect( state ).to.eql( {} );
		} );

		it( 'should set that site ID to true if a request is initiated', () => {
			const state = requesting( {}, {
				type: SITE_ROLES_REQUEST,
				siteId: 12345678
			} );

			expect( state ).to.eql( {
				12345678: true
			} );
		} );

		it( 'should set that site ID to false if a request finishes succesfully', () => {
			const state = requesting( {}, {
				type: SITE_ROLES_REQUEST_SUCCESS,
				siteId: 12345678
			} );

			expect( state ).to.eql( {
				12345678: false
			} );
		} );

		it( 'should set that site ID to false if a request finishes unsuccesfully', () => {
			const state = requesting( {}, {
				type: SITE_ROLES_REQUEST_FAILURE,
				siteId: 12345678
			} );

			expect( state ).to.eql( {
				12345678: false
			} );
		} );

		it( 'should not persist state', () => {
			const state = requesting( deepFreeze( {
				12345678: true
			} ), {
				type: SERIALIZE
			} );

			expect( state ).to.eql( {} );
		} );

		it( 'should not load persisted state', () => {
			const state = requesting( deepFreeze( {
				12345678: true
			} ), {
				type: DESERIALIZE
			} );

			expect( state ).to.eql( {} );
		} );
	} );

	describe( '#items()', () => {
		const roles = [
			{
				name: 'administrator',
				display_name: 'Administrator',
				capabilities: {
					activate_plugins: true,
					edit_users: true,
					manage_options: true
				}
			},
			{
				name: 'customer',
				display_name: 'Customer',
				capabilities: {
					read: true
				}
			}
		];
		const altRoles = [
			{
				name: 'customer',
				display_name: 'Customer',
				capabilities: {
					read: true,
					level_0: true
				}
			}
		];

		it( 'should default to an empty object', () => {
			const state = items( undefined, {} );

			expect( state ).to.eql( {} );
		} );

		it( 'should index roles by site ID', () => {
			const state = items( {}, {
				type: SITE_ROLES_RECEIVE,
				siteId: 12345678,
				roles
			} );

			expect( state ).to.eql( {
				12345678: roles
			} );
		} );

		it( 'should override previous roles of same site ID', () => {
			const state = items( deepFreeze( {
				12345678: roles,
				87654321: roles
			} ), {
				type: SITE_ROLES_RECEIVE,
				siteId: 87654321,
				roles: altRoles
			} );

			expect( state ).to.eql( {
				12345678: roles,
				87654321: altRoles
			} );
		} );

		it( 'should persist state', () => {
			const state = items( deepFreeze( {
				12345678: roles,
				87654321: altRoles
			} ), {
				type: SERIALIZE
			} );

			expect( state ).to.eql( {
				12345678: roles,
				87654321: altRoles
			} );
		} );

		it( 'should load valid persisted state', () => {
			const state = items( deepFreeze( {
				12345678: roles,
				87654321: altRoles
			} ), {
				type: DESERIALIZE
			} );

			expect( state ).to.eql( {
				12345678: roles,
				87654321: altRoles
			} );
		} );

		it( 'should not load invalid persisted state', () => {
			const state = items( deepFreeze( {
				1234567: [ {
					name: 'test',
					capabilities: {
						test: true
					}
				} ]
			} ), {
				type: DESERIALIZE
			} );

			expect( state ).to.eql( {} );
		} );
	} );
} );
