/**
 * External dependencies
 */
var assert = require( 'chai' ).assert;

/**
 * Internal dependencies
 */
import useFakeDom from 'test/helpers/use-fake-dom';

describe( 'Happiness engineers actions', function() {
	let HappinessEngineersActions;

	useFakeDom();

	beforeEach( function() {
		HappinessEngineersActions = require( 'lib/happiness-engineers/actions' );
	} );

	it( 'Actions should be an object', function() {
		assert.isObject( HappinessEngineersActions );
	} );

	it( 'Actions should have method fetch', function() {
		assert.isFunction( HappinessEngineersActions.fetch );
	} );
} );
