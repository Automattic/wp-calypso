/**
 * External dependencies
 */
import { assert } from 'chai';
import validate from 'is-my-json-valid';

/**
 * Internal dependencies
 */
import { itemsSchema } from '../schema';

describe( 'schema', () => {
	let validator;
	beforeEach( () => {
		validator = validate( itemsSchema );
	} );

	test( 'should validate the basic object', () => {
		const isValid = validator( {
			1234: {
				feed_ID: 1,
				blog_ID: 2,
			},
		} );
		assert.isTrue( isValid, validator.error );
	} );

	test( 'should validate a full object', () => {
		const isValid = validator( {
			1234: {
				feed_ID: 1,
				blog_ID: 2,
				name: 'foo',
				URL: 'http://example.com',
				feed_URL: 'http://example.com/feed',
				is_following: true,
				subscribers_count: 10,
				meta: {},
			},
		} );
		assert.isTrue( isValid, validator.error );
	} );

	test( 'should allow null props', () => {
		const isValid = validator( {
			1234: {
				feed_ID: 1,
				blog_ID: 2,
				name: null,
				URL: null,
				feed_URL: null,
				is_following: null,
				subscribers_count: null,
				meta: null,
			},
		} );
		assert.isTrue( isValid, validator.error );
	} );

	test( 'shall not let bad data pass', () => {
		assert.isFalse(
			validator( {
				1234: {
					feed_ID: '1', // feed_ID should be an actual integer, not a string
					blog_ID: 2,
					name: null,
					URL: null,
					feed_URL: null,
					is_following: null,
					subscribers_count: null,
					meta: null,
				},
			} )
		);
	} );
} );
