/**
 * External dependencies
 */
import { assert } from 'chai';
import mockery from 'mockery';

/**
 * Internal dependencies
 */
import mockedWporg from './lib/mock-wporg';

const testDispatch = ( test, testCallNumber ) => {
	let calls = 0;
	return ( action ) => {
		calls++;
		if ( ! testCallNumber || testCallNumber === calls ) {
			test( action );
		}
	};
};

describe( 'WPorg Data Actions', function() {
	let WPorgActions;
	before( function() {
		mockery.enable( {
			warnOnReplace: false,
			warnOnUnregistered: false
		} );
		mockery.registerMock( 'lib/wporg', mockedWporg );
		mockery.registerMock( 'lib/impureLodash', {
			debounce: cb => cb,
		} );

		WPorgActions = require( '../actions' );
	} );

	after( function() {
		mockery.deregisterAll();
		mockery.disable();
	} );

	beforeEach( function() {
		mockedWporg.reset();
	} );

	it( 'Actions should be an object', function() {
		assert.isObject( WPorgActions );
	} );

	it( 'Actions should have method fetchPluginData', function() {
		assert.isFunction( WPorgActions.fetchPluginData );
	} );

	it( 'FetchPluginData action should make a request', function( done ) {
		WPorgActions.fetchPluginData( 'test' )( testDispatch( function() {
			assert.equal( mockedWporg.getActivity().fetchPluginInformation, 1 );
			done();
		}, 2 ) );
	} );

	it( 'FetchPluginData action shouldn\'t return an error', function( done ) {
		WPorgActions.fetchPluginData( 'test' )( testDispatch( function( action ) {
			done( action.error );
		}, 2 ) );
	} );

	it( 'FetchPluginData action should return a plugin ', function( done ) {
		WPorgActions.fetchPluginData( 'test' )( testDispatch( function( action ) {
			assert.equal( action.data.slug, 'test' );
			done();
		}, 2 ) );
	} );

	it( 'FetchPluginData action should not make another request if there\'s already one in progress', function() {
		mockedWporg.deactivatedCallbacks = true;
		WPorgActions.fetchPluginData( 'test' )( function() { } );
		WPorgActions.fetchPluginData( 'test' )( function() { } );
		assert.equal( mockedWporg.getActivity().fetchPluginInformation, 1 );
	} );
} );
