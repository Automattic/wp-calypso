/**
 * Internal dependencies
 */
import actions from './fixtures/actions';

describe( 'Plugins Log Store', () => {
	let Dispatcher, LogStore;

	beforeEach( () => {
		Dispatcher = require( 'dispatcher' );
		LogStore = require( '../log-store' );
	} );

	test( 'logs an update error', () => {
		const initialErrors = LogStore.getErrors().length;
		Dispatcher.handleServerAction( actions.updatedPluginError );
		expect( LogStore.getErrors() ).toHaveLength( initialErrors + 1 );
	} );

	test( 'removing error notices clears the error log', () => {
		Dispatcher.handleServerAction( actions.removeErrorNotices );
		expect( LogStore.getErrors() ).toHaveLength( 0 );
	} );
} );
