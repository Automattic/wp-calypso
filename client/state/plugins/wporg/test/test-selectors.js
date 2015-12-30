/**
 * External dependencies
 */
import { assert } from 'chai';

/**
 * Internal dependencies
 */
import selectors from '../selectors';

const state = {
	test: Object.freeze( { slug: 'test' } ),
	fetchingTest: Object.freeze( { slug: 'fetchingTest', isFetching: true } )
};

describe( 'WPorg Selectors', function() {
	before( function() {
	} );

	after( function() {
	} );

	it( 'Should contain getPlugin method', function() {
		assert.equal( typeof selectors.getPlugin, 'function' );
	} );

	it( 'Should contain isFetching method', function() {
		assert.equal( typeof selectors.isFetching, 'function' );
	} );

	describe( 'getPlugin', function() {
		it( 'Should get null if the requested plugin is not in the current state', function() {
			assert.equal( selectors.getPlugin( state, 'no-test' ), null );
		} );

		it( 'Should get the plugin if the requested plugin is in the current state', function() {
			assert.equal( selectors.getPlugin( state, 'test' ).slug, 'test' );
		} );

		it( 'Should return a new object with no pointers to the one stored in state', function() {
			let plugin = selectors.getPlugin( state, 'test' );
			plugin.isFetching = true;
			assert.equal( selectors.getPlugin( state, 'test' ).isFetching, undefined );
		} );
	} );

	describe( 'isFetching', function() {
		it( 'Should get `false` if the requested plugin is not in the current state', function() {
			assert.equal( selectors.isFetching( state, 'no.test' ), false );
		} );

		it( 'Should get `false` if the requested plugin is not being fetched', function() {
			assert.equal( selectors.isFetching( state, 'test' ), false );
		} );

		it( 'Should get `true` if the requested plugin is being fetched', function() {
			assert.equal( selectors.isFetching( state, 'fetchingTest' ), true );
		} );
	} );
} );
