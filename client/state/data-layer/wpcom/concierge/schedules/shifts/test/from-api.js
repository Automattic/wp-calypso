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
			schedule_id: 999,
			description: 'an example',
			not_going_to_take_this: 'should ignore this one',
		};

		expect( transformShift( mockShift ) ).toEqual( {
			beginTimestamp: mockShift.begin_timestamp,
			endTimestamp: mockShift.end_timestamp,
			scheduleId: mockShift.schedule_id,
			description: mockShift.description,
		} );
	} );
} );

describe( 'fromApi()', () => {
	test( 'should validate and transform the data successfully.', () => {
		const validResponse = [
			{
				begin_timestamp: 100,
				end_timestamp: 200,
				schedule_id: 999,
				description: 'shift 1',
			},
			{
				begin_timestamp: 300,
				end_timestamp: 400,
				schedule_id: 999,
				description: 'shift 2',
			},
		];

		const expectedResult = [
			{
				beginTimestamp: validResponse[ 0 ].begin_timestamp,
				endTimestamp: validResponse[ 0 ].end_timestamp,
				scheduleId: validResponse[ 0 ].schedule_id,
				description: validResponse[ 0 ].description,
			},
			{
				beginTimestamp: validResponse[ 1 ].begin_timestamp,
				endTimestamp: validResponse[ 1 ].end_timestamp,
				scheduleId: validResponse[ 1 ].schedule_id,
				description: validResponse[ 1 ].description,
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
					schedule_id: null,
					description: 'so wrong',
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
					schedule_id: 999,
					description: 'wrong',
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
					begin_timestamp: 'haha',
					schedule_id: 999,
					description: 'wrong',
				},
			];

			fromApi( invalidResponse );
		};

		expect( invalidateMissingEndTimestamp ).toThrowError( SchemaError );
	} );

	test( 'should invalidate missing schedule_id.', () => {
		const invalidateMissingScheduleId = () => {
			const invalidResponse = [
				{
					begin_timestamp: 'haha',
					end_timestamp: 400,
					description: 'wrong',
				},
			];

			fromApi( invalidResponse );
		};

		expect( invalidateMissingScheduleId ).toThrowError( SchemaError );
	} );
} );
