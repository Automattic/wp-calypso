/**
 * Internal dependencies
 */
import { SIMPLE_PAYMENTS_PRODUCT_POST_TYPE } from 'lib/simple-payments/constants';

export const isValidSimplePaymentsProduct = product =>
	product.type === SIMPLE_PAYMENTS_PRODUCT_POST_TYPE && product.status === 'publish';

/**
 * Replace any encoded html entities ( i.e. '&#8220; or &amp; ) with their corresponding unicode value
 * @param { String } productAttribute a product attribute
 * @returns { String } The product attribute with any html entities decoded.
 */
export const decodeProductAttribute = productAttribute =>
	productAttribute.replace( /(?:&#(\d+);)|(&amp;)/g, ( match, charCode, amp ) =>
		amp ? '\u0026' : String.fromCharCode( charCode )
	);
