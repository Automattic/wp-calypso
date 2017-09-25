/**
 * External dependencies
 */
import { assert } from 'chai';

/**
 * Internal dependencies
 */
import olarkStore from 'lib/olark-store';

describe( 'index', function() {
	it( 'Olark store data should be an object', function() {
		const data = olarkStore.get();
		assert.isObject( data );
	} );

	it( 'Olark store data should have expected properties', function() {
		const data = olarkStore.get();
		assert.isBoolean( data.isOlarkReady );
		assert.isBoolean( data.isOperatorAvailable );
		assert.isObject( data.details );
	} );
} );
