/**
 * External dependencies
 */
var assert = require( 'chai' ).assert,
	mockery = require( 'mockery' );

/**
 * Internal dependencies
 */
var actions = require( 'lib/data-actions' ),
	mockedActions = require( 'lib/mock-actions' );

describe( 'WPORG Plugins Store', function() {
	var Dispatcher, PluginsDataStore;

	before( function() {
		mockery.enable( {
			warnOnReplace: false,
			warnOnUnregistered: false
		} );
		mockery.registerMock( 'lodash/function/debounce', function( cb ) {
			return cb;
		} );
		mockery.registerMock( 'lib/plugins/wporg-data/actions', mockedActions );
	} );

	after( function() {
		mockery.disable();
	} );

	beforeEach( function() {
		Dispatcher = require( 'dispatcher' );
		PluginsDataStore = require( 'lib/plugins/wporg-data/store' );
	} );

	it( 'Store should be an object', function() {
		assert.isObject( PluginsDataStore );
	} );

	it( 'Store should have method emitChange', function() {
		assert.isFunction( PluginsDataStore.emitChange );
	} );

	it( 'Store should have method getPlugin', function() {
		assert.isFunction( PluginsDataStore.get );
	} );

	describe( 'Fetch .org Plugins', function() {
		it( 'should return undefiend if the plugin is not fetched from .org', function() {
			var Akismet = PluginsDataStore.get( 'akismet' );
			assert.isUndefined( Akismet );
		} );

		it( 'should store the plugin data from org if the plugin exists in .org', function() {
			var Akismet;
			Dispatcher.handleServerAction( actions.fetchedPlugin );
			Akismet = PluginsDataStore.get( 'akismet' );
			assert.isObject( Akismet );
			assert.equal( Akismet.slug, 'akismet' );
		} );

		it( 'should return null if the plugin doesn\'t exists in the .org', function() {
			var Nokismet;
			Dispatcher.handleServerAction( actions.fetchedNoPlugin );
			Nokismet = PluginsDataStore.get( 'no-kismet' );
			assert.isNull( Nokismet );
		} );
	} );
} );
