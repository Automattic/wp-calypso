/** @format */

/**
 * External dependencies
 */
describe( 'Sites Log Store', () => {
	let Dispatcher, LogStore, actions;

	beforeAll( () => {
		Dispatcher = require( 'dispatcher' );
		LogStore = require( '../log-store' );
		actions = require( './mocks/lib/actions' );
	} );

	test( 'should initialize with no Errors', () => {
		expect( LogStore.getErrors().length ).toBe( 0 );
	} );

	test( 'removing an error notice deletes an error', () => {
		Dispatcher.handleServerAction( actions.removeNotices );
		expect( LogStore.getErrors().length ).toBe( 0 );
	} );
} );
