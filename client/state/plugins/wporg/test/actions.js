jest.mock( 'lib/wporg', () => require( './mocks/lib/wporg' ) );
jest.mock( 'lib/impure-lodash', () => ( {
	debounce: cb => cb,
} ) );

/**
 * External dependencies
 */
import { assert } from 'chai';

/**
 * Internal dependencies
 */
import wporg from 'lib/wporg';
import WPorgActions from '../actions';

const testDispatch = ( test, testCallNumber ) => {
	let calls = 0;
	return ( action ) => {
		calls++;
		if ( ! testCallNumber || testCallNumber === calls ) {
			test( action );
		}
	}
};

describe( 'WPorg Data Actions', function() {
	beforeEach( function() {
		wporg.reset();
	} );

	it( 'Actions should be an object', function() {
		assert.isObject( WPorgActions );
	} );

	it( 'Actions should have method fetchPluginData', function() {
		assert.isFunction( WPorgActions.fetchPluginData );
	} );

	it( 'FetchPluginData action should make a request', function( done ) {
		WPorgActions.fetchPluginData( 'test' )( testDispatch( function() {
			assert.equal( wporg.getActivity().fetchPluginInformation, 1 );
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
		wporg.deactivatedCallbacks = true;
		WPorgActions.fetchPluginData( 'test' )( function() { } );
		WPorgActions.fetchPluginData( 'test' )( function() { } );
		assert.equal( wporg.getActivity().fetchPluginInformation, 1 );
	} );
} );
