/** @format */

/**
 * Internal dependencies
 */
import { SchemaError } from 'state/data-layer/wpcom-http/utils';
import fromApi from '../from-api';

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
} );
