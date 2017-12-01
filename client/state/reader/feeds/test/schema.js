/** @format */
/**
 * External dependencies
 */
import { assert } from 'chai';
import Ajv from 'ajv';
import draft04 from 'ajv/lib/refs/json-schema-draft-04.json';
// validateSchema: false because of these errors:
// data.patternProperties['^[0-9a-z]+$'].properties['image'].type should be equal to one of the allowed values
// data.patternProperties['^[0-9a-z]+$'].properties['image'].type[1] should be equal to one of the allowed values
// data.patternProperties['^[0-9a-z]+$'].properties['image'].type should match some schema in anyOf
const ajv = new Ajv( { validateSchema: false } );
ajv.addMetaSchema( draft04 );

/**
 * Internal dependencies
 */
import { itemsSchema } from '../schema';

describe( 'schema', () => {
	let validator;
	beforeEach( () => {
		validator = ajv.compile( itemsSchema );
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
