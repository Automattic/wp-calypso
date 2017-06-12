/**
 * External dependencies
 */
import { assert } from 'chai';

describe( 'Sites Log Store', () => {
	let Dispatcher, LogStore, actions;

	before( () => {
		Dispatcher = require( 'dispatcher' );
		LogStore = require( '../log-store' );
		actions = require( './mocks/lib/actions' );
	} );

	it( 'should initialize with no Errors', () => {
		assert.lengthOf( LogStore.getErrors(), 0 );
	} );

	it( 'removing an error notice deletes an error', () => {
		Dispatcher.handleServerAction( actions.removeNotices );
		assert.lengthOf( LogStore.getErrors(), 0 );
	} );
} );
