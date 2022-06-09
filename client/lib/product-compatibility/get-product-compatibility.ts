import { getPolicyById, NO_CONFLICTS_FOUND } from './policies';
import { productConcurrencyRules } from './rules';

const getProductCompatibility = ( existingProducts: string[], newProduct: string ) => {
	for ( let i = 0; i < existingProducts.length; i++ ) {
		const thisExistingProduct = existingProducts[ i ];
		for ( let j = 0; j < productConcurrencyRules.length; j++ ) {
			const thisRule = productConcurrencyRules[ j ];
			if (
				thisRule.existingProduct === thisExistingProduct &&
				thisRule.attemptingToPurchase === newProduct
			) {
				const thisPolicy = getPolicyById( thisRule.rule );
				if ( thisPolicy ) {
					thisPolicy.conflictingProduct = thisExistingProduct;
					return thisPolicy;
				}
			}
		}
	}

	return getPolicyById( NO_CONFLICTS_FOUND );
};

export default getProductCompatibility;
