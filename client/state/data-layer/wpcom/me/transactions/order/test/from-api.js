/** @format */

/**
 * Internal dependencies
 */
import { SchemaError } from 'state/data-layer/wpcom-http/utils';
import fromApi from '../from-api';

describe( 'wpcom-api', () => {
	describe( 'fromApi()', () => {
		test( 'should validate and return the data successfully.', () => {
			const response = {
				user_id: 123,
				order_id: 456,
				processing_status: 'profit!',
			};

			const expect = {
				userId: response.user_id,
				orderId: response.order_id,
				processingStatus: response.processing_status,
			};

			expect( fromApi( response ) ).toEqual( response );
		} );

		test( 'should invalidate when the required field is missing.', () => {
			const invalidateCall = () => {
				const invalidResponse = {
					noStatus: 'I have no status!',
				};

				fromApi( invalidResponse );
			};

			expect( invalidateCall ).toThrowError( SchemaError );
		} );
	} );
} );
