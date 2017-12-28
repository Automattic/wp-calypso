/** @format */

/**
 * Internal dependencies
 */

import { SIMPLE_PAYMENTS_PRODUCT_POST_TYPE } from 'client/lib/simple-payments/constants';

export const isValidSimplePaymentsProduct = product =>
	product.type === SIMPLE_PAYMENTS_PRODUCT_POST_TYPE && product.status === 'publish';
