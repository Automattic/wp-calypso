/** @format */

/**
 * External dependencies
 */
import { assert } from 'chai';

/**
 * Internal dependencies
 */
import olarkStore from 'lib/olark-store';

describe( 'index', () => {
	test( 'Olark store data should be an object', () => {
		const data = olarkStore.get();
		assert.isObject( data );
	} );

	test( 'Olark store data should have expected properties', () => {
		const data = olarkStore.get();
		assert.isBoolean( data.isOlarkReady );
		assert.isBoolean( data.isOperatorAvailable );
		assert.isObject( data.details );
	} );
} );
