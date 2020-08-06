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
}

const ProductComponent = ( {
	product,
	onClick,
	currencyCode,
}: {
	product: Product;
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
		/>
	);
};

const ProductsColumn = ( { duration, onProductClick, productType }: ProductsColumnType ) => {
	const currencyCode = useSelector( ( state ) => getCurrentUserCurrencyCode( state ) );
	const isFetchingProducts = useSelector( ( state ) => isProductsListFetching( state ) );

	const productObjects: Product[] = useMemo(
		() =>
			JETPACK_PRODUCTS_LIST.map( ( productSlug ) => getProductFromSlug( productSlug ) ).filter(
				( product: Product ) =>
					!! product?.product_slug &&
					! product.product_slug.startsWith( 'wpcom' ) &&
					PRODUCTS_TYPES[ productType ].includes( product.product_slug ) &&
					( duration === TERM_ANNUALLY ? ! isMonthly( product ) : isMonthly( product ) )
			),
		[ duration, productType ]
	);

	if ( ! currencyCode || isFetchingProducts ) {
		return null; // TODO: Loading component!
	}

	return (
		<div>
			<FormattedHeader headerText={ translate( 'Individual Products' ) } brandFont />
			{ productObjects.map( ( product ) => (
				<ProductComponent
					onClick={ onProductClick }
					product={ product }
					currencyCode={ currencyCode }
				/>
			) ) }
		</div>
	);
};

export default ProductsColumn;
