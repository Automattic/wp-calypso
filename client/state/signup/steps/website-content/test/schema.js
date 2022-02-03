import { assert } from 'chai';
import validator from 'is-my-json-valid';
import { initialState, schema, initialTestState } from '../schema';

describe( 'schema', () => {
	test( 'Schema should be valid', () => {
		assert.doesNotThrow( () => {
			validator( schema );
		}, Error );
	} );

	test( 'Empty schema should be invalid', () => {
		const isValidSchema = validator( schema )( {} );
		assert.isFalse( isValidSchema );
	} );

	test( 'Initial state should be valid', () => {
		const isValidSchema = validator( schema )( initialState );
		assert.isTrue( isValidSchema );
	} );

	test( 'The sample state for Tests should adhere to the schema', () => {
		const isValidSchema = validator( schema )( initialTestState );
		assert.isTrue( isValidSchema );
	} );
} );
