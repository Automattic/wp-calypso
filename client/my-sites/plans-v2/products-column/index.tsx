/**
 * External dependencies
 */
import React, { useMemo } from 'react';
import { translate } from 'i18n-calypso';
import { useSelector } from 'react-redux';

/**
 * Internal dependencies
 */
import {
	durationToText,
	slugToItem,
	itemToSelectorProduct,
	productButtonLabel,
	getProductPrices,
} from '../utils';
import { PRODUCTS_TYPES, SELECTOR_PRODUCTS } from '../constants';
import { isProductsListFetching, getAvailableProductsList } from 'state/products-list/selectors';
import { getCurrentUserCurrencyCode } from 'state/current-user/selectors';
import getSiteProducts from 'state/sites/selectors/get-site-products';
import JetpackProductCard from 'components/jetpack/card/jetpack-product-card';
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

const ProductComponent = ( {
	product,
	onClick,
	currencyCode,
}: {
	product: SelectorProduct;
	onClick: PurchaseCallback;
	currencyCode: string;
} ) => (
	<JetpackProductCard
		iconSlug={ product.iconSlug }
		productName={ product.displayName }
		subheadline={ product.tagline }
		description={ product.description }
		currencyCode={ currencyCode }
		billingTimeFrame={ durationToText( product.term ) }
		buttonLabel={ productButtonLabel( product ) }
		onButtonClick={ () => onClick( product.productSlug ) }
		features={ { items: [] } }
		discountedPrice={ product.discountCost }
		originalPrice={ product.cost || 0 }
		isOwned={ product.owned }
	/>
);

const ProductsColumn = ( {
	duration,
	onProductClick,
	productType,
	siteId,
}: ProductsColumnType ) => {
	const currencyCode = useSelector( ( state ) => getCurrentUserCurrencyCode( state ) );
	const isFetchingProducts = useSelector( ( state ) => isProductsListFetching( state ) );
	const availableProducts = useSelector( ( state ) => getAvailableProductsList( state ) );
	const currentProducts = (
		useSelector( ( state ) => getSiteProducts( state, siteId ) ) || []
	).map( ( product ) => product.productSlug );

	const productObjects: SelectorProduct[] = useMemo(
		() =>
			SELECTOR_PRODUCTS.map( ( productSlug ) => {
				const item = slugToItem( productSlug );
				return item && itemToSelectorProduct( item );
			} )
				.filter(
					( product: SelectorProduct | null ): product is SelectorProduct =>
						!! product &&
						duration === product.term &&
						PRODUCTS_TYPES[ productType ].includes( product.productSlug )
				)
				.map( ( product: SelectorProduct ) => ( {
					...product,
					...getProductPrices( product, availableProducts ),
					owned: currentProducts.includes( product.productSlug ),
				} ) ),
		[ duration, productType, currentProducts, availableProducts ]
	);

	if ( ! currencyCode || isFetchingProducts ) {
		return null; // TODO: Loading component!
	}

	return (
		<div className="plans-column products-column">
			<FormattedHeader headerText={ translate( 'Individual Products' ) } brandFont />
			{ productObjects.map( ( product ) => (
				<ProductComponent
					key={ product.productSlug }
					onClick={ onProductClick }
					product={ product }
					currencyCode={ currencyCode }
				/>
			) ) }
		</div>
	);
};

export default ProductsColumn;
