/**
 * Internal dependencies
 */
import { SIMPLE_PAYMENTS_PRODUCT_POST_TYPE } from 'lib/simple-payments/constants';

export const isValidSimplePaymentsProduct = product =>
	product.type === SIMPLE_PAYMENTS_PRODUCT_POST_TYPE && product.status === 'publish';

export const decodeProductAttribute = productAttribute =>
	productAttribute.replace( /(?:&#(\d+);)|(&amp;)/g, ( match, charCode, amp ) =>
		amp ? '\u0026' : String.fromCharCode( charCode )
	);
