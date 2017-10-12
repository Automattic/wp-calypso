/** @format */

/**
 * External dependencies
 */
import actions from './fixtures/actions';

describe( 'Plugins Log Store', () => {
	let Dispatcher, LogStore, initialErrors;

	beforeEach( () => {
		Dispatcher = require( 'dispatcher' );
		LogStore = require( '../log-store' );
		initialErrors = LogStore.getErrors().length;
	} );

	test( 'logs an update error', () => {
		Dispatcher.handleServerAction( actions.updatedPluginError );
		expect( LogStore.getErrors().length ).toBe( initialErrors + 1 );
	} );

	test( 'removing an error notice deletes an error', () => {
		Dispatcher.handleServerAction( actions.removeErrorNotice );
		expect( LogStore.getErrors().length ).toBe( initialErrors - 1 );
	} );
} );
