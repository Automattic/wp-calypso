/**
 * External dependencies
 */
import { translate } from 'i18n-calypso';
import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';

/**
 * Internal dependencies
 */
import { slugToSelectorProduct } from '../utils';
import { PRODUCTS_TYPES, SELECTOR_PRODUCTS } from '../constants';
import ProductCard from '../product-card';
import { getCurrentUserCurrencyCode } from 'state/current-user/selectors';
import FormattedHeader from 'components/formatted-header';

/**
 * Type dependencies
 */
import type { Duration, PurchaseCallback, ProductType, SelectorProduct } from '../types';

interface ProductsColumnType {
	duration: Duration;
	onProductClick: PurchaseCallback;
	productType: ProductType;
	siteId: number | null;
}

const ProductsColumn = ( {
	duration,
	onProductClick,
	productType,
	siteId,
}: ProductsColumnType ) => {
	const currencyCode = useSelector( ( state ) => getCurrentUserCurrencyCode( state ) );

	// Gets all products in an array to be parsed.
	const productObjects: SelectorProduct[] = useMemo(
		() =>
			// Convert product slugs to ProductSelector types.
			SELECTOR_PRODUCTS.map( slugToSelectorProduct )
				// Remove products that don't fit the filters or have invalid data.
				.filter(
					( product: SelectorProduct | null ): product is SelectorProduct =>
						!! product &&
						duration === product.term &&
						PRODUCTS_TYPES[ productType ].includes( product.productSlug )
				),
		[ duration, productType ]
	);

	if ( ! currencyCode ) {
		return null; // TODO: Loading component!
	}

	return (
		<div className="plans-column products-column">
			<FormattedHeader headerText={ translate( 'Individual Products' ) } brandFont />
			{ productObjects.map( ( product ) => (
				<ProductCard
					key={ product.productSlug }
					item={ product }
					onClick={ onProductClick }
					siteId={ siteId }
					currencyCode={ currencyCode }
				/>
			) ) }
		</div>
	);
};

export default ProductsColumn;
