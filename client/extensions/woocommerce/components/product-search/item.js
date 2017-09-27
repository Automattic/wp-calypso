/** @format */
/**
 * External dependencies
 */
import React from 'react';
import CompactCard from 'components/card/compact';

const ProductItem = ( { product } ) => {
	const featuredImage = product.images && product.images[ 0 ];

	return (
		<CompactCard className="product-search__item">
			<div className="product-search__image">
				{ featuredImage && <img src={ featuredImage.src } /> }
			</div>
			<div className="product-search__label">
				<div className="product-search__name">{ product.name }</div>
				<div className="product-search__sku">{ product.sku }</div>
			</div>
		</CompactCard>
	);
};

export default ProductItem;
