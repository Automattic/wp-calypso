/**
 * External dependencies
 */
var assert = require( 'chai' ).assert;

require( 'lib/react-test-env-setup' )();

describe( 'Happiness engineers actions', function() {
	var HappinessEngineersActions;

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
