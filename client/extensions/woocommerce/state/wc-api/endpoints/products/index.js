/** @format */

/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import meta from '../meta';
import { fetchProduct } from 'woocommerce/state/sites/products/actions';

export default ( wcApiSite, endpointData ) => {
	function getSingle( productId, requirements ) {
		const fetchAction = fetchProduct( wcApiSite, productId );
		meta.setRequirements( 'product:' + productId, requirements, fetchAction );
		return get( endpointData, [ 'products', productId ], null );
	}

	return {
		getSingle,
	};
};
