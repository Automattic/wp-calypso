/** @format */

/**
 * Internal dependencies
 */
import { SchemaError } from 'state/data-layer/wpcom-http/utils';
import fromApi, { transformShift } from '../from-api';

describe( 'transformShift()', () => {
	test( 'should pick out expected fields and make the keys camelCase.', () => {
		const mockShift = {
			begin_timestamp: 100,
			end_timestamp: 200,
			not_going_to_take_this: 'should ignore this one',
		};

		// Note: We're ensuring that the timestamps are converted from Unix seconds to JS milliseconds
		expect( transformShift( mockShift ) ).toEqual( {
			beginTimestamp: mockShift.begin_timestamp * 1000,
			endTimestamp: mockShift.end_timestamp * 1000,
		} );
	} );
} );

describe( 'fromApi()', () => {
	test( 'should validate and transform the data successfully.', () => {
		const validResponse = [
			{
				begin_timestamp: 100,
				end_timestamp: 200,
				description: 'shift 1',
			},
			{
				begin_timestamp: 300,
				end_timestamp: 400,
				description: 'shift 2',
			},
		];

		const expectedResult = [
			{
				beginTimestamp: validResponse[ 0 ].begin_timestamp * 1000,
				endTimestamp: validResponse[ 0 ].end_timestamp * 1000,
			},
			{
				beginTimestamp: validResponse[ 1 ].begin_timestamp * 1000,
				endTimestamp: validResponse[ 1 ].end_timestamp * 1000,
			},
		];
		expect( fromApi( validResponse ) ).toEqual( expectedResult );
	} );

	test( 'should invalidate unexpected field types.', () => {
		const invalidateCall = () => {
			const invalidFieldTypes = [
				{
					begin_timestamp: 'haha',
					end_timestamp: 200,
				},
			];

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
