/**
 * External dependencies
 */
var assert = require( 'chai' ).assert;

/**
 * Internal dependencies
 */
var actions = require( './lib/mock-actions' ),
	site = require( './lib/mock-site' ),
	siteId = site.ID;

require( 'lib/react-test-env-setup' )();

describe( 'Viewers Store', function() {
	var Dispatcher, RolesStore;

	beforeEach( function() {
		Dispatcher = require( 'dispatcher' );
		RolesStore = require( '../store' );
	} );

	describe( 'Shape of store', function() {
		it( 'Store should be an object', function() {
			assert.isObject( RolesStore );
		} );

		it( 'Store should have method getRoles', function() {
			assert.isFunction( RolesStore.getRoles );
		} );
	} );

	describe( 'Get Roles', function() {
		it( 'Should return empty object when there are no roles', function() {
			var roles = RolesStore.getRoles( siteId );

			assert.isObject( roles );
			assert( 0 === Object.keys( roles ).length, 'roles is empty' );
		} );

		it( 'Should return an object of role objects when there are roles', function() {
			var roles;

			Dispatcher.handleServerAction( actions.fetchedRoles );
			roles = RolesStore.getRoles( siteId );

			assert.isObject( roles );
			assert( 0 !== Object.keys( roles ).length, 'roles is not empty' );
			assert.isObject( roles[ Object.keys( roles )[0] ] );
		} );
	} );
} );
