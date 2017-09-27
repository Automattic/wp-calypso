/** @format */
/**
 * External dependencies
 */
import React from 'react';
import CompactCard from 'components/card/compact';

/**
 * Internal dependencies
 */
import getKeyboardHandler from 'woocommerce/lib/get-keyboard-handler';

const ProductItem = ( { product, onClick } ) => {
	const featuredImage = product.images && product.images[ 0 ];

	const onClickProduct = () => {
		onClick( product );
	};

	return (
		<CompactCard
			className="product-search__item"
			role="button"
			tabIndex="0"
			onClick={ onClickProduct }
			onKeyDown={ getKeyboardHandler( onClickProduct ) }
		>
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
