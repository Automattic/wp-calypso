/**
 * Internal dependencies
 */
import fromApi, { convertProcessingStatus } from '../from-api';
import { ORDER_TRANSACTION_STATUS } from 'calypso/state/order-transactions/constants';

describe( 'wpcom-api', () => {
	describe( 'fromApi()', () => {
		test( 'should validate and return the data successfully.', () => {
			const response = {
				user_id: 123,
				order_id: 456,
				receipt_id: 123456,
				processing_status: 'success',
			};

			const expectedOutput = {
				userId: response.user_id,
				orderId: response.order_id,
				receiptId: response.receipt_id,
				processingStatus: ORDER_TRANSACTION_STATUS.SUCCESS,
			};

			expect( fromApi( response ) ).toEqual( expectedOutput );
		} );

		test( 'should still validate since receipt id is optional.', () => {
			const response = {
				user_id: 123,
				order_id: 456,
				processing_status: 'success',
			};

			const expectedOutput = {
				userId: response.user_id,
				orderId: response.order_id,
				processingStatus: ORDER_TRANSACTION_STATUS.SUCCESS,
			};

			expect( fromApi( response ) ).toEqual( expectedOutput );
		} );

		test( 'should invalidate when the required field is missing.', () => {
			const invalidateCall = () => {
				const invalidResponse = {
					noStatus: 'I have no status!',
				};

				fromApi( invalidResponse );
			};

			expect( invalidateCall ).toThrow( Error, 'Failed to validate with JSON schema' );
		} );
	} );

	describe( 'convertProcessingStatus()', () => {
		test( 'should convert to success', () => {
			expect( convertProcessingStatus( 'success' ) ).toEqual( ORDER_TRANSACTION_STATUS.SUCCESS );
		} );

		test( 'should convert to processing.', () => {
			expect( convertProcessingStatus( 'processing' ) ).toEqual(
				ORDER_TRANSACTION_STATUS.PROCESSING
			);
		} );

		test( 'should convert to failure.', () => {
			expect( convertProcessingStatus( 'payment-failure' ) ).toEqual(
				ORDER_TRANSACTION_STATUS.FAILURE
			);
		} );

		test( 'should convert to error.', () => {
			expect( convertProcessingStatus( 'error' ) ).toEqual( ORDER_TRANSACTION_STATUS.ERROR );
		} );

		test( 'should convert to unknown.', () => {
			expect( convertProcessingStatus( 'profit!' ) ).toEqual( ORDER_TRANSACTION_STATUS.UNKNOWN );
		} );
	} );
} );
