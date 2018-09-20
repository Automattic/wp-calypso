/** @format */
/**
 * External dependencies
 */
import { assert } from 'chai';

/**
 * Internal dependencies
 */
import { fetchPluginData } from '../actions';
import wporg from 'lib/wporg';
jest.mock( 'lib/wporg', () => require( './mocks/lib/wporg' ) );
jest.mock( 'lib/impure-lodash', () => ( {
	debounce: cb => cb,
} ) );

const testDispatch = ( test, testCallNumber ) => {
	let calls = 0;
	return action => {
		calls++;
		if ( ! testCallNumber || testCallNumber === calls ) {
			test( action );
		}
	};
};

describe( 'WPorg Data Actions', () => {
	beforeEach( () => {
		wporg.reset();
	} );

	test( 'Actions should have method fetchPluginData', () => {
		assert.isFunction( fetchPluginData );
	} );

	test( 'FetchPluginData action should make a request', done => {
		fetchPluginData( 'test' )(
			testDispatch( function() {
				assert.equal( wporg.getActivity().fetchPluginInformation, 1 );
				done();
			}, 2 )
		);
	} );

	test( "FetchPluginData action shouldn't return an error", done => {
		fetchPluginData( 'test' )(
			testDispatch( function( action ) {
				done( action.error );
			}, 2 )
		);
	} );

	test( 'FetchPluginData action should return a plugin ', done => {
		fetchPluginData( 'test' )(
			testDispatch( function( action ) {
				assert.equal( action.data.slug, 'test' );
				done();
			}, 2 )
		);
	} );

	test( "FetchPluginData action should not make another request if there's already one in progress", () => {
		wporg.deactivatedCallbacks = true;
		fetchPluginData( 'test' )( function() {} );
		fetchPluginData( 'test' )( function() {} );
		assert.equal( wporg.getActivity().fetchPluginInformation, 1 );
	} );
} );
