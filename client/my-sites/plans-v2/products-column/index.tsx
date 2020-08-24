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
import FormattedHeader from 'components/formatted-header';
import { getPlan } from 'lib/plans';
import { JETPACK_PRODUCTS_LIST } from 'lib/products-values/constants';
import { getCurrentUserCurrencyCode } from 'state/current-user/selectors';
import getSitePlan from 'state/sites/selectors/get-site-plan';
import getSiteProducts from 'state/sites/selectors/get-site-products';

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

	// Plan
	const currentPlan =
		useSelector( ( state ) => getSitePlan( state, siteId ) )?.product_slug || null;

	// Owned products (plans are filtered out)
	const siteProducts = useSelector( ( state ) => getSiteProducts( state, siteId ) ) || [];
	const ownedProducts = siteProducts
		.map( ( { productSlug } ) => productSlug )
		.filter( ( productSlug ) => JETPACK_PRODUCTS_LIST.includes( productSlug ) );

	// Features included in plan
	const includedInPlanProducts: string[] =
		( currentPlan && getPlan( currentPlan )?.getHiddenFeatures() ) || [];

	// The list of displayed products comes from a concatenation of:
	// - Owned products from a direct purchase.
	// - Included as a feature of an owned plan.
	// - Generic/option product bundles with subtypes.
	const productObjects: SelectorProduct[] = useMemo(
		() =>
			// Convert product slugs to ProductSelector types.
			[ ...new Set( [ ...ownedProducts, ...includedInPlanProducts, ...SELECTOR_PRODUCTS ] ) ]
				.map( slugToSelectorProduct )
				// Remove products that don't fit the filters or have invalid data.
				.filter(
					( product: SelectorProduct | null ): product is SelectorProduct =>
						!! product &&
						duration === product.term &&
						PRODUCTS_TYPES[ productType ].includes( product.productSlug ) &&
						// Don't include a generic/option card if the user already owns a subtype.
						! ownedProducts.some( ( ownedProduct ) => product.subtypes.includes( ownedProduct ) ) &&
						// Don't include a generic/option card if the product is included in the owned plan.
						! includedInPlanProducts.some( ( includedProduct ) =>
							product.subtypes.includes( includedProduct )
						)
				),
		[ duration, includedInPlanProducts, ownedProducts, productType ]
	);

	if ( ! currencyCode ) {
		return null; // TODO: Loading component!
	}

	return (
		<div className="plans-column products-column">
			<FormattedHeader headerText={ translate( 'Individual Products' ) } isSecondary brandFont />
			{ productObjects.map( ( product ) => (
				<ProductCard
					key={ product.productSlug }
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
