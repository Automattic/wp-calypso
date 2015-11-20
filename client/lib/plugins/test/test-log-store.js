var assert = require( 'assert' ),
	actions = require( 'lib/mock-actions' );

describe( 'Plugins Log Store', function() {
	var Dispatcher, LogStore, initialErrors;

	beforeEach( function() {
		Dispatcher = require( 'dispatcher' );
		LogStore = require( '../log-store' );
		initialErrors = LogStore.getErrors().length;
	} );

	it( 'logs an update error', function() {
		Dispatcher.handleServerAction( actions.updatedPluginError );
		assert.equal( LogStore.getErrors().length, initialErrors + 1 );
	} );

	it( 'removing an error notice deletes an error', function() {
		Dispatcher.handleServerAction( actions.removeErrorNotice );
		assert.equal( LogStore.getErrors().length, initialErrors - 1 );
	} );
} );
