var assert = require( 'assert' ),
	actions = require( 'lib/mock-actions' );

describe( 'Sites Log Store', function() {
	var Dispatcher, LogStore;

	beforeEach( function() {
		Dispatcher = require( 'dispatcher' );
		LogStore = require( '../log-store' );
	} );

	it( 'should initialize with no Errors', function() {
		assert.equal( LogStore.getErrors().length, 0 );
	} );

	it( 'logs an update error', function() {
		Dispatcher.handleServerAction( actions.disconnectedSiteError );
		assert.equal( LogStore.getErrors().length, 1 );
	} );

	it( 'removing an error notice deletes an error', function() {
		Dispatcher.handleServerAction( actions.removeNotices );
		assert.equal( LogStore.getErrors().length, 0 );
	} );

} );
