/** @format */

/**
 * Internal dependencies
 */
import { makeParser } from 'state/data-layer/wpcom-http/utils';
import responseSchema from './schema';

export const transform = ( { order_id, user_id, processing_status } ) => ( {
	orderId: order_id,
	userId: user_id,
	processingStatus: processing_status,
} );

export default makeParser( responseSchema, {}, transform );
