/**
 * Internal dependencies
 */
import makeJsonSchemaParser from 'lib/make-json-schema-parser';
import responseSchema from './schema';
import { ORDER_TRANSACTION_STATUS } from 'state/order-transactions/constants';

export const convertProcessingStatus = ( responseStatus ) => {
	switch ( responseStatus ) {
		case 'processing':
			return ORDER_TRANSACTION_STATUS.PROCESSING;
		case 'async-pending':
			return ORDER_TRANSACTION_STATUS.ASYNC_PENDING;
		case 'success':
			return ORDER_TRANSACTION_STATUS.SUCCESS;
		case 'payment-failure':
			return ORDER_TRANSACTION_STATUS.FAILURE;
		case 'error':
			return ORDER_TRANSACTION_STATUS.ERROR;
		default:
			return ORDER_TRANSACTION_STATUS.UNKNOWN;
	}
};

export const transform = ( { order_id, user_id, receipt_id, processing_status } ) => ( {
	orderId: order_id,
	userId: user_id,
	receiptId: receipt_id,
	processingStatus: convertProcessingStatus( processing_status ),
} );

export default makeJsonSchemaParser( responseSchema, transform );
