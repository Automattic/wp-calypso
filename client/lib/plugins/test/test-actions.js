/**
 * External dependencies
 */
var assert = require( 'chai' ).assert,
	mockery = require( 'mockery' );

/**
 * Internal dependencies
 */
var mockedWpcom = require( 'lib/mock-wpcom' ),
	mockedSite = require( 'lib/mock-site' );

describe( 'WPcom Data Actions', function() {
	var actions;

	before( function() {
		mockery.enable( {
			warnOnReplace: false,
			warnOnUnregistered: false
		} );
		mockery.registerMock( 'lib/wp', mockedWpcom );
	} );

	after( function() {
		mockery.disable();
	} );

	beforeEach( function() {
		actions = require( 'lib/plugins/actions' );
		actions.resetQueue();
		mockedWpcom.undocumented().reset();
	} );

	it( 'Actions should be an object', function() {
		assert.isObject( actions );
	} );

	it( 'Actions should have method installPlugin', function() {
		assert.isFunction( actions.installPlugin );
	} );

	it( 'when installing a plugin, it should send a install request to .com', function( done ) {
		actions.installPlugin( mockedSite, 'test', function() {} ).then( function() {
			assert.equal( mockedWpcom.getActivity().pluginsInstallCalls, 1 );
			done();
		} ).catch( done );
	} );

	it( 'when installing a plugin, it should send an activate request to .com', function( done ) {
		actions.installPlugin( mockedSite, 'test', function() {} ).then( function() {
			assert.equal( mockedWpcom.getActivity().pluginsActivateCalls, 1 );
			done();
		} ).catch( done );
	} );

	it( 'when installing a plugin, it should not send a request to .com when the site doesn\'t allow us to update its files', function() {
		actions.installPlugin( { canUpdateFiles: false }, 'test', function() {} );
		assert.equal( mockedWpcom.getActivity().pluginsInstallCalls, 0 );
	} );

	it( 'Actions should have method removePlugin', function() {
		assert.isFunction( actions.removePlugin );
	} );

	it( 'when removing a plugin, it should send a remove request to .com', function( done ) {
		actions.removePlugin( {
			canUpdateFiles: true,
			user_can_manage: true
		}, {}, function() {} ).then( function() {
			assert.equal( mockedWpcom.getActivity().pluginsRemoveCalls, 1 );
			done();
		} ).catch( done );
	} );

	it( 'when removing a plugin, it should send an deactivate request to .com', function( done ) {
		actions.removePlugin( {
			canUpdateFiles: true,
			user_can_manage: true,
			jetpack: true
		}, { active: true }, function() {} ).then( function() {
			assert.equal( mockedWpcom.getActivity().pluginsDeactivateCalls, 1 );
			done();
		} ).catch( done );
	} );

	it( 'when removing a plugin, it should not send a request to .com when the site doesn\'t allow us to update its files', function() {
		actions.removePlugin( { canUpdateFiles: false }, {}, function() {} );
		assert.equal( mockedWpcom.getActivity().pluginsRemoveCalls, 0 );
	} );
} );
