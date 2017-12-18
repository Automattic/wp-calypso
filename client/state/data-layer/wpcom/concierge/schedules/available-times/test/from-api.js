/** @format */

/**
 * Internal dependencies
 */
import { SchemaError } from 'state/data-layer/wpcom-http/utils';
import fromApi from '../from-api';

describe( 'fromApi()', () => {
	test( 'should validate and transform the data successfully.', () => {
		const validResponse = [
			1483264800, // unix timestamp of 2017-01-01 10:00:00 UTC
			1483266600, // unix timestamp of 2017-01-01 10:30:00 UTC
			1483268400, // unix timestamp of 2017-01-01 11:00:00 UTC
		];

		const expectedResult = [ 1483264800000, 1483266600000, 1483268400000 ];

		expect( fromApi( validResponse ) ).toEqual( expectedResult );
	} );

	test( 'should invalidate unexpected field types.', () => {
		const invalidateCall = () => {
			const invalidFieldTypes = [ 'this', 'is', false, 'just wrong.' ];

			fromApi( invalidFieldTypes );
		};

		expect( invalidateCall ).toThrowError( SchemaError );
	} );

	test( 'should invalidate missing begin_timestamp.', () => {
		const invalidateMissingBeginTimestamp = () => {
			const invalidResponse = [
				{
					end_timestamp: 400,
				},
			];

			fromApi( invalidResponse );
		};

		expect( invalidateMissingBeginTimestamp ).toThrowError( SchemaError );
	} );

	test( 'should invalidate missing end_timestamp.', () => {
		const invalidateMissingEndTimestamp = () => {
			const invalidResponse = [
				{
					begin_timestamp: 333,
				},
			];

			fromApi( invalidResponse );
		};

		expect( invalidateMissingEndTimestamp ).toThrowError( SchemaError );
	} );
} );
