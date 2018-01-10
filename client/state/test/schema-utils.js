/** @format */
/**
 * Internal dependencies
 */
import { throwIfSchemaInvalid } from 'state/schema-utils';

describe( 'schema-utils', () => {
	describe( '#throwIfSchemaInvalid', () => {
		test( 'should warn when called with invalid schema', () => {
			expect( () => throwIfSchemaInvalid( false ) ).toThrow();
		} );
	} );
} );
