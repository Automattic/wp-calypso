/**
 * External dependencies
 */
import React, { useMemo } from 'react';
import { translate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { JETPACK_PRODUCTS_LIST } from 'lib/products-values/constants';
import JetpackProductCard from 'components/jetpack/card/jetpack-product-card';
import {
	getJetpackProductDescription,
	getJetpackProductDisplayName,
	getJetpackProductShortName,
	getJetpackProductTagline,
	isMonthly,
	getProductFromSlug,
} from 'lib/products-values';
import { durationToText } from '../utils';
import { TERM_ANNUALLY } from 'lib/plans/constants';

/**
 * Type dependencies
 */
import type { Duration, PurchaseCallback } from '../types';
import type { Product } from 'lib/products-values/products-list';

interface ProductsColumnType {
	duration: Duration;
	onProductClick: PurchaseCallback;
}

const ProductsColumn = ( { duration, onProductClick }: ProductsColumnType ) => {
	const productObjects: Product[] = useMemo(
		() =>
			JETPACK_PRODUCTS_LIST.map( ( productSlug ) => getProductFromSlug( productSlug ) )
				.filter( ( product: Product ) =>
					duration === TERM_ANNUALLY ? ! isMonthly( product ) : isMonthly( product )
				)
				.filter(
					( product: Product ) =>
						!! product?.product_slug && ! product.product_slug.startsWith( 'wpcom' )
				),
		[ duration ]
	);

	return (
		<div>
			{ productObjects.map( ( product ) => (
				<JetpackProductCard
					iconSlug={ product.product_slug }
					productName={ getJetpackProductDisplayName( product ) }
					subheadline={ getJetpackProductTagline( product ) }
					description={ getJetpackProductDescription( product ) }
					currencyCode="USD"
					billingTimeFrame={ durationToText( product.term ) }
					buttonLabel={ translate( 'Get %s', { args: getJetpackProductShortName( product ) } ) }
					onButtonClick={ () => onProductClick( product.product_slug ) }
					features={ { items: [] } }
					originalPrice={ 100 }
				/>
			) ) }
		</div>
	);
};

export default ProductsColumn;
