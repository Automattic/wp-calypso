/**
 * Internal dependencies
 */
import { getProduct } from './get-product';

export const createSelectors = ( endpoints ) => {
	return {
		getProduct: getProduct( endpoints ),
	};
};
