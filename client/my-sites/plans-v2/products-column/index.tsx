/**
 * External dependencies
 */
import { translate } from 'i18n-calypso';
import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';

/**
 * Internal dependencies
 */
import { getJetpackDescriptionWithOptions } from '../utils';
import { PRODUCTS_TYPES } from '../constants';
import ProductCard from '../product-card';
import useGetPlansGridProducts from '../use-get-plans-grid-products';
import FormattedHeader from 'calypso/components/formatted-header';
import { getCurrentUserCurrencyCode } from 'calypso/state/current-user/selectors';

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

	const { availableProducts, purchasedProducts, includedInPlanProducts } = useGetPlansGridProducts(
		siteId
	);

	const productObjects: SelectorProduct[] = useMemo( () => {
		// Products that have not been directly purchased must honor the current filter
		// selection since they exist in both monthly and yearly version.
		const filteredProducts = [ ...includedInPlanProducts, ...availableProducts ]
			// Remove products that don't fit the filters or have invalid data.
			.filter( ( product ): product is SelectorProduct => !! product && duration === product.term );
		return (
			[ ...purchasedProducts, ...filteredProducts ]
				// Only show cards that correspond to the selected productType filter.
				.filter(
					( product ): product is SelectorProduct =>
						!! product && PRODUCTS_TYPES[ productType ].includes( product.productSlug )
				)
				.map( ( product ) => ( {
					...product,
					description: getJetpackDescriptionWithOptions( product as SelectorProduct ),
				} ) )
		);
	}, [ duration, availableProducts, includedInPlanProducts, purchasedProducts, productType ] );

	return (
		<div className="plans-column products-column">
			<FormattedHeader headerText={ translate( 'Individual Products' ) } isSecondary brandFont />
			{ productObjects.map( ( product ) => (
				<ProductCard
					// iconSlug has the same value for all durations. Using this value as a key
					// prevents unnecessary DOM updates.
					key={ product.iconSlug }
					item={ product }
					onClick={ onProductClick }
					siteId={ siteId }
					currencyCode={ currencyCode }
					highlight
				/>
			) ) }
		</div>
	);
};

export default ProductsColumn;
