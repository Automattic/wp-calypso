/** @format */
/**
 * External dependencies
 */
import WPorgActions from '../actions';
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

	test( 'Actions should be an object', () => {
		expect( typeof WPorgActions ).toBe( 'object' );
	} );

	test( 'Actions should have method fetchPluginData', () => {
		expect( typeof WPorgActions.fetchPluginData ).toBe( 'function' );
	} );

	test( 'FetchPluginData action should make a request', done => {
		WPorgActions.fetchPluginData( 'test' )(
			testDispatch( function() {
				expect( wporg.getActivity().fetchPluginInformation ).toEqual( 1 );
				done();
			}, 2 )
		);
	} );

	test( "FetchPluginData action shouldn't return an error", done => {
		WPorgActions.fetchPluginData( 'test' )(
			testDispatch( function( action ) {
				done( action.error );
			}, 2 )
		);
	} );

	test( 'FetchPluginData action should return a plugin ', done => {
		WPorgActions.fetchPluginData( 'test' )(
			testDispatch( function( action ) {
				expect( action.data.slug ).toEqual( 'test' );
				done();
			}, 2 )
		);
	} );

	test( "FetchPluginData action should not make another request if there's already one in progress", () => {
		wporg.deactivatedCallbacks = true;
		WPorgActions.fetchPluginData( 'test' )( function() {} );
		WPorgActions.fetchPluginData( 'test' )( function() {} );
		expect( wporg.getActivity().fetchPluginInformation ).toEqual( 1 );
	} );
} );
