/** @format */

/**
 * Internal dependencies
 */
import fromApi from '../from-api';
import { SchemaError } from 'lib/make-json-schema-parser';

describe( 'fromApi()', () => {
	test( 'should validate and transform the data successfully.', () => {
		const validResponse = {
			begin_timestamp: 1,
			end_timestamp: 2,
			schedule_id: 3,
			site_info: {
				ID: '12345',
				siteurl: 'https://wordpress.com',
				blogname: 'WordPress',
			},
		};
		const expectedResult = {
			beginTimestamp: 1000,
			endTimestamp: 2000,
			scheduleId: 3,
			siteInfo: {
				id: '12345',
				siteUrl: 'https://wordpress.com',
				blogName: 'WordPress',
			},
		};

		expect( fromApi( validResponse ) ).toEqual( expectedResult );
	} );

	test( 'should persist fields that were not altered.', () => {
		const validResponse = {
			id: 1,
			begin_timestamp: 1,
			end_timestamp: 2,
			schedule_id: 3,
			site_info: {
				ID: '12345',
				siteurl: 'https://wordpress.com',
				blogname: 'WordPress',
			},
		};
		const expectedResult = {
			id: 1,
			beginTimestamp: 1000,
			endTimestamp: 2000,
			scheduleId: 3,
			siteInfo: {
				id: '12345',
				siteUrl: 'https://wordpress.com',
				blogName: 'WordPress',
			},
		};

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
