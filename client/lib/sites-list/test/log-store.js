/**
 * External dependencies
 */
import { assert } from 'chai';

/**
 * Internal dependencies
 */
import useMockery from 'test/helpers/use-mockery';

describe( 'Sites Log Store', () => {
	let Dispatcher, LogStore, actions;

	useMockery();

	before( () => {
		Dispatcher = require( 'dispatcher' );
		LogStore = require( '../log-store' );
		actions = require( './mocks/lib/actions' );
	} );

	it( 'should initialize with no Errors', () => {
		assert.lengthOf( LogStore.getErrors(), 0 );
	} );

	it( 'logs an update error', () => {
		Dispatcher.handleServerAction( actions.disconnectedSiteError );
		assert.lengthOf( LogStore.getErrors(), 1 );
	} );

	it( 'removing an error notice deletes an error', () => {
		Dispatcher.handleServerAction( actions.removeNotices );
		assert.lengthOf( LogStore.getErrors(), 0 );
	} );
} );
