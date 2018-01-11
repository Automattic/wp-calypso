/** @format */

/**
 * External dependencies
 */
import { get } from 'lodash';

export default function productDescriptors( siteData ) {
	function single( productId /* TODO: Add `requirements` here */ ) {
		// TODO: Add this product to the subscribed data list.
		const product = get( siteData, [ 'products', productId ], null );
		return product;
	}

	return {
		single,
	};
}
