/**
 * Internal dependencies
 */
import products from './products';

export const createEndpoints = ( endpointData ) => {
	return {
		products: products( endpointData ),
	};
};
