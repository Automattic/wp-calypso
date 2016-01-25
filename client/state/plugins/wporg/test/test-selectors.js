/**
 * External dependencies
 */
import { assert } from 'chai';

/**
 * Internal dependencies
 */
import selectors from '../selectors';

const state = {
	test: Object.freeze( { slug: 'test', isFetching: false } ),
	fetchingTest: Object.freeze( { slug: 'fetchingTest', isFetching: true } ),
	fetchedTest: Object.freeze( { slug: 'fetchingTest', isFetching: false, fetched: true } ),
	fetchedTest2: Object.freeze( { slug: 'fetchingTest', isFetching: true, fetched: true } )
};

describe( 'WPorg Selectors', function() {
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
			assert.equal( selectors.getPlugin( state, 'test' ).isFetching, false );
		} );
	} );

	describe( 'isFetching', function() {
		it( 'Should get `true` if the requested plugin is not in the current state', function() {
			assert.equal( selectors.isFetching( state, 'no.test' ), true );
		} );

		it( 'Should get `false` if the requested plugin is not being fetched', function() {
			assert.equal( selectors.isFetching( state, 'test' ), false );
		} );

		it( 'Should get `true` if the requested plugin is being fetched', function() {
			assert.equal( selectors.isFetching( state, 'fetchingTest' ), true );
		} );
	} );

	describe( 'isFetched', function() {
		it( 'Should get `false` if the requested plugin is not in the current state', function() {
			assert.equal( selectors.isFetched( state, 'no.test' ), false );
		} );

		it( 'Should get `false` if the requested plugin has not being fetched', function() {
			assert.equal( selectors.isFetched( state, 'test' ), false );
		} );

		it( 'Should get `true` if the requested plugin has being fetched', function() {
			assert.equal( selectors.isFetched( state, 'fetchedTest' ), true );
		} );

		it( 'Should get `true` if the requested plugin has being fetched even if it\'s being fetche again', function() {
			assert.equal( selectors.isFetched( state, 'fetchedTest2' ), true );
		} );
	} );
} );
