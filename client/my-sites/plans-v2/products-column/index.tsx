/**
 * External dependencies
 */
import React, { useMemo } from 'react';
import { translate } from 'i18n-calypso';
import { useSelector } from 'react-redux';

/**
 * Internal dependencies
 */
import { durationToText } from '../utils';
import { PRODUCTS_TYPES } from '../constants';
import { JETPACK_PRODUCTS_LIST } from 'lib/products-values/constants';
import {
	getJetpackProductDescription,
	getJetpackProductDisplayName,
	getJetpackProductShortName,
	getJetpackProductTagline,
	isMonthly,
	getProductFromSlug,
} from 'lib/products-values';
import { TERM_ANNUALLY } from 'lib/plans/constants';
import { getProductCost, isProductsListFetching } from 'state/products-list/selectors';
import { getCurrentUserCurrencyCode } from 'state/current-user/selectors';
import getSiteProducts from 'state/sites/selectors/get-site-products';
import JetpackProductCard from 'components/jetpack/card/jetpack-product-card';
import FormattedHeader from 'components/formatted-header';

/**
 * Type dependencies
 */
import type { Duration, PurchaseCallback, ProductType } from '../types';
import type { Product } from 'lib/products-values/products-list';

interface ProductsColumnType {
	duration: Duration;
	onProductClick: PurchaseCallback;
	productType: ProductType;
	siteId: number | null;
}

type ProductWithBought = Product & { owned?: boolean };

const ProductComponent = ( {
	product,
	onClick,
	currencyCode,
}: {
	product: ProductWithBought;
	onClick: PurchaseCallback;
	currencyCode: string;
} ) => {
	const price = useSelector( ( state ) => getProductCost( state, product.product_slug ) ) || 0;
	return (
		<JetpackProductCard
			iconSlug={ product.product_slug }
			productName={ getJetpackProductDisplayName( product ) }
			subheadline={ getJetpackProductTagline( product ) }
			description={ getJetpackProductDescription( product ) }
			currencyCode={ currencyCode }
			billingTimeFrame={ durationToText( product.term ) }
			buttonLabel={ translate( 'Get %s', {
				args: getJetpackProductShortName( product ),
				context: '%s is the name of a product',
			} ) }
			onButtonClick={ () => onClick( product.product_slug ) }
			features={ { items: [] } }
			originalPrice={ price }
			isOwned={ product.owned }
		/>
	);
};

const ProductsColumn = ( {
	duration,
	onProductClick,
	productType,
	siteId,
}: ProductsColumnType ) => {
	const currencyCode = useSelector( ( state ) => getCurrentUserCurrencyCode( state ) );
	const isFetchingProducts = useSelector( ( state ) => isProductsListFetching( state ) );
	const currentProducts = (
		useSelector( ( state ) => getSiteProducts( state, siteId ) ) || []
	).map( ( product ) => product.productSlug );

	const productObjects: ProductWithBought[] = useMemo(
		() =>
			JETPACK_PRODUCTS_LIST.map( ( productSlug ) => getProductFromSlug( productSlug ) )
				.filter(
					( product: Product ) =>
						!! product?.product_slug &&
						! product.product_slug.startsWith( 'wpcom' ) &&
						PRODUCTS_TYPES[ productType ].includes( product.product_slug ) &&
						( duration === TERM_ANNUALLY ? ! isMonthly( product ) : isMonthly( product ) )
				)
				.map( ( product: Product ) => ( {
					...product,
					owned: currentProducts.includes( product.product_slug ),
				} ) ),
		[ duration, productType, currentProducts ]
	);

	if ( ! currencyCode || isFetchingProducts ) {
		return null; // TODO: Loading component!
	}

	return (
		<div>
			<FormattedHeader headerText={ translate( 'Individual Products' ) } brandFont />
			{ productObjects.map( ( product ) => (
				<ProductComponent
					key={ product.product_slug }
					onClick={ onProductClick }
					product={ product }
					currencyCode={ currencyCode }
				/>
			) ) }
		</div>
	);
};

export default ProductsColumn;
