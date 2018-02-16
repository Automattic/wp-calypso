/**
 * Internal dependencies
 */
import products from './products';

export const createEndpoints = ( wcApiSite, endpointData ) => {
	return {
		products: products( wcApiSite, endpointData ),
	};
};
