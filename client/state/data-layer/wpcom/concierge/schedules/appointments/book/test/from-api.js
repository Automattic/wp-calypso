/** @format */

/**
 * Internal dependencies
 */
import fromApi from '../from-api';
import { SchemaError } from 'lib/make-json-schema-parser';

describe( 'fromApi()', () => {
	test( 'should validate and transform the data successfully.', () => {
		const validResponse = true;
		const expectedResult = true;

		expect( fromApi( validResponse ) ).toEqual( expectedResult );
	} );

	test( 'should invalidate unexpected field types.', () => {
		const invalidateCall = () => {
			const invalidFieldTypes = [ 'this', 'is', false, 'just wrong.' ];

			fromApi( invalidFieldTypes );
		};

		expect( invalidateCall ).toThrowError( SchemaError );
	} );
} );
