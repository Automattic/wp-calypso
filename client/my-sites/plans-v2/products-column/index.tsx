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
import { getCurrentUserCurrencyCode } from 'state/current-user/selectors';
import getSitePlan from 'state/sites/selectors/get-site-plan';

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
	const currentPlan =
		useSelector( ( state ) => getSitePlan( state, siteId ) )?.product_slug || null;

	// Get features (products) included in the current user plan.
	const ownedFeatures: string[] =
		( currentPlan && getPlan( currentPlan )?.getHiddenFeatures() ) || [];

	// Gets all products in an array to be parsed.
	const productObjects: SelectorProduct[] = useMemo(
		() =>
			// Convert product slugs to ProductSelector types.
			[ ...new Set( [ ...ownedFeatures, ...SELECTOR_PRODUCTS ] ) ]
				.map( slugToSelectorProduct )
				// Remove products that don't fit the filters or have invalid data.
				.filter(
					( product: SelectorProduct | null ): product is SelectorProduct =>
						!! product &&
						duration === product.term &&
						PRODUCTS_TYPES[ productType ].includes( product.productSlug ) &&
						// Don't include a generic/option card if the user already owns a subtype.
						! ownedFeatures.some( ( ownedFeature ) => product.subtypes.includes( ownedFeature ) )
				),
		[ duration, ownedFeatures, productType ]
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
