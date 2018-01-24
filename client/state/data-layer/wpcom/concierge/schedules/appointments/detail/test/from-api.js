/** @format */

/**
 * Internal dependencies
 */
import { SchemaError } from 'state/data-layer/wpcom-http/utils';
import fromApi from '../from-api';

describe( 'fromApi()', () => {
	test( 'should validate and transform the data successfully.', () => {
		const validResponse = { begin_timestamp: 1, end_timestamp: 2, schedule_id: 3 };
		const expectedResult = { beginTimestamp: 1, endTimestamp: 2, scheduleId: 3 };

		expect( fromApi( validResponse ) ).toEqual( expectedResult );
	} );

	test( 'should keep not transformed fields.', () => {
		const validResponse = { id: 1, begin_timestamp: 1, end_timestamp: 2, schedule_id: 3 };
		const expectedResult = { id: 1, beginTimestamp: 1, endTimestamp: 2, scheduleId: 3 };

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
