/**
 * External dependencies
 */
import { assert } from 'chai';

/**
 * Internal dependencies
 */
import useMockery from 'test/helpers/use-mockery';
import useFakeDom from 'test/helpers/use-fake-dom';

describe( 'Viewers Store', () => {
	let Dispatcher, RolesStore;
	let actions, site, siteId;

	useMockery();
	useFakeDom();

	before( () => {
		Dispatcher = require( 'dispatcher' );
		RolesStore = require( '../store' );
		actions = require( './lib/mock-actions' );
		site = require( './lib/mock-site' );
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
			let roles = RolesStore.getRoles( siteId );

			assert.isObject( roles );
			assert.lengthOf( Object.keys( roles ), 0, 'roles is empty' );
		} );

		it( 'Should return an object of role objects when there are roles', () => {
			Dispatcher.handleServerAction( actions.fetchedRoles );
			let roles = RolesStore.getRoles( siteId );

			assert.isObject( roles );
			assert.notDeepEqual( Object.keys( roles ), [], 'roles is not empty' );
			assert.isObject( roles[ Object.keys( roles )[ 0 ] ] );
		} );
	} );
} );
