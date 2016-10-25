/**
 * Tests for helpers.js
 */

/**
 * External dependencies
 */
import { assert } from 'chai';

/**
 * Internal dependencies
 */
import {
	generateCacheKey
} from '../helpers.js';

describe( 'helpers', () => {
	describe( 'generateCacheKey', () => {
		it( 'returns the same cache key when objects are identical', () => {
			const params1 = {
				search: 'commerce',
				tier: 'premium',
				filter: 'color:blue',
				page: 2,
				perPage: 24,
			};

			const params2 = {
				search: 'commerce',
				tier: 'premium',
				filter: 'color:blue',
				page: 2,
				perPage: 24,
			};

			assert.equal( generateCacheKey( params1 ), generateCacheKey( params2 ) );
		} );

		it( 'returns the same cache key when objects are identical but properties are out of order', () => {
			const params1 = {
				search: 'commerce',
				tier: 'premium',
				filter: 'color:blue',
				page: 2,
				perPage: 24,
			};

			const params2 = {
				page: 2,
				search: 'commerce',
				perPage: 24,
				filter: 'color:blue',
				tier: 'premium',
			};

			assert.notEqual( JSON.stringify( params1 ), JSON.stringify( params2 ) );
			assert.equal( generateCacheKey( params1 ), generateCacheKey( params2 ) );
		} );
	} );
} );
