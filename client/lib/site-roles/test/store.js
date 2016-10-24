/**
 * External dependencies
 */
import { assert } from 'chai';

/**
 * Internal dependencies
 */
import useMockery from 'test/helpers/use-mockery';

describe( 'Viewers Store', () => {
	let Dispatcher, RolesStore;
	let actions, site, siteId;

	useMockery();

	before( () => {
		Dispatcher = require( 'dispatcher' );
		RolesStore = require( '../store' );
		actions = require( './mocks/lib/actions' );
		site = require( './fixtures/site' );
		siteId = site.ID;
	} );

	describe( 'Shape of store', () => {
		it( 'Store should be an object', () => {
			assert.isObject( RolesStore );
		} );

		it( 'Store should have method getRoles', () => {
			assert.isFunction( RolesStore.getRoles );
		} );
	} );

	describe( 'Get Roles', () => {
		it( 'Should return empty object when there are no roles', () => {
			const roles = RolesStore.getRoles( siteId );

			assert.isObject( roles );
			assert.lengthOf( Object.keys( roles ), 0, 'roles is empty' );
		} );

		it( 'Should return an object of role objects when there are roles', () => {
			Dispatcher.handleServerAction( actions.fetchedRoles );
			const roles = RolesStore.getRoles( siteId );

			assert.isObject( roles );
			assert.notDeepEqual( Object.keys( roles ), [], 'roles is not empty' );
			assert.isObject( roles[ Object.keys( roles )[ 0 ] ] );
		} );
	} );
} );
