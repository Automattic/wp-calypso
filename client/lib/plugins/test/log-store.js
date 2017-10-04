/** @format */
/**
 * External dependencies
 */
import { assert } from 'chai';

/**
 * Internal dependencies
 */
import actions from './fixtures/actions';

describe( 'Plugins Log Store', () => {
	let Dispatcher, LogStore, initialErrors;

	beforeEach( () => {
		Dispatcher = require( 'dispatcher' );
		LogStore = require( '../log-store' );
		initialErrors = LogStore.getErrors().length;
	} );

	it( 'logs an update error', function() {
		Dispatcher.handleServerAction( actions.updatedPluginError );
		assert.lengthOf( LogStore.getErrors(), initialErrors + 1 );
	} );

	it( 'removing an error notice deletes an error', function() {
		Dispatcher.handleServerAction( actions.removeErrorNotice );
		assert.lengthOf( LogStore.getErrors(), initialErrors - 1 );
	} );
} );
