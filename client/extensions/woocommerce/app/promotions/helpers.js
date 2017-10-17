/**
 * External dependencies
 */
import { find, includes, without } from 'lodash';

export function hasCategory( product, categoryId ) {
	if ( ! product.categories || 0 === product.categories.length ) {
		return false;
	}

	return Boolean( find( product.categories, { id: categoryId } ) );
}

export function editCategoryIdSelected( categoryIds, categoryId, selected ) {
	const isIncluded = includes( categoryIds, categoryId );

	if ( selected && ! isIncluded ) {
		return [ ...categoryIds, categoryId ];
	}
	if ( ! selected && isIncluded ) {
		return without( categoryIds, categoryId );
	}
	return categoryIds;
}

export function editProductIdSelected( productIds, productId, selected ) {
	const isIncluded = includes( productIds, productId );

	if ( selected && ! isIncluded ) {
		return [ ...productIds, productId ];
	}
	if ( ! selected && isIncluded ) {
		return without( productIds, productId );
	}
	return productIds;
}

export function editCategoryProductIdsSelected( productIds, categoryId, selected, allProducts ) {
	const categoryProducts = allProducts.filter(
		( product ) => hasCategory( product, categoryId )
	);

	return categoryProducts.reduce(
		( accumulatedProductIds, product ) => {
			return editProductIdSelected( accumulatedProductIds, product.id, selected );
		},
		productIds
	);
}

