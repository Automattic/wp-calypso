/**
 * Internal dependencies
 */
import fromApi from '../from-api';

describe( 'fromApi()', () => {
	test( 'should validate and transform the data successfully.', () => {
		const validResponse = {
			available_times: [ 1483264800, 1483266600, 1483268400 ],
			appointment_timespan: 999,
			next_appointment: { begin_timestamp: 1, end_timestamp: 2, schedule_id: 3 },
			schedule_id: 123,
		};

		const expectedResult = {
			availableTimes: [ 1483264800000, 1483266600000, 1483268400000 ],
			appointmentTimespan: 999,
			nextAppointment: { beginTimestamp: 1000, endTimestamp: 2000, scheduleId: 3 },
			scheduleId: 123,
		};

		expect( fromApi( validResponse ) ).toEqual( expectedResult );
	} );

	test( 'should leave a null next_appointment as null.', () => {
		const validResponse = {
			available_times: [ 1483264800, 1483266600, 1483268400 ],
			next_appointment: null,
		};

		const expectedResult = {
			availableTimes: [ 1483264800000, 1483266600000, 1483268400000 ],
			nextAppointment: null,
		};

		expect( fromApi( validResponse ) ).toEqual( expectedResult );
	} );

	test( 'should invalidate unexpected field types.', () => {
		const invalidateCall = () => {
			const invalidFieldTypes = [ 'this', 'is', false, 'just wrong.' ];

			fromApi( invalidFieldTypes );
		};

		expect( invalidateCall ).toThrow( Error, 'Failed to validate with JSON schema' );
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

		expect( invalidateMissingBeginTimestamp ).toThrow(
			Error,
			'Failed to validate with JSON schema'
		);
	} );

	test( 'should invalidate missing end_timestamp.', () => {
		const invalidateMissingEndTimestamp = () => {
			const invalidResponse = {
				available_times: [
					{
						begin_timestamp: 333,
					},
				],
			};

			fromApi( invalidResponse );
		};

		expect( invalidateMissingEndTimestamp ).toThrow( Error, 'Failed to validate with JSON schema' );
	} );
} );
