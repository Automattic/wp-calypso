/**
 * External dependencies
 */
import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { sortBy } from 'lodash';

/**
 * Internal dependencies
 */
import isJetpackCloud from 'calypso/lib/jetpack/is-jetpack-cloud';
import { JETPACK_LEGACY_PLANS } from 'calypso/lib/plans/constants';
import { getCurrentUserCurrencyCode } from 'calypso/state/current-user/selectors';
import getSitePlan from 'calypso/state/sites/selectors/get-site-plan';
import getSelectedSiteId from 'calypso/state/ui/selectors/get-selected-site-id';
import JetpackFreeCard from 'calypso/components/jetpack/card/jetpack-free-card-alt';
import { slugToSelectorProduct } from '../utils';
import useGetPlansGridProducts from '../use-get-plans-grid-products';
import { getProductPosition } from '../product-grid/products-order';
import ProductCardAlt from '../product-card-alt';
import { getPlansToDisplay, getProductsToDisplay, isConnectionFlow } from '../product-grid/utils';

/**
 * Type dependencies
 */
import type { ProductsGridProps } from '../types';

/**
 * Style dependencies
 */
import './style.scss';

const ProductsGridAlt: React.FC< ProductsGridProps > = ( {
	duration,
	onSelectProduct,
	urlQueryArgs,
} ) => {
	const siteId = useSelector( getSelectedSiteId );
	const currencyCode = useSelector( getCurrentUserCurrencyCode );
	const currentPlanSlug =
		useSelector( ( state ) => getSitePlan( state, siteId ) )?.product_slug || null;

	const { availableProducts, purchasedProducts, includedInPlanProducts } = useGetPlansGridProducts(
		siteId
	);

	const plansToDisplay = useMemo( () => getPlansToDisplay( { duration, currentPlanSlug } ), [
		duration,
		currentPlanSlug,
	] );
	const productsToDisplay = useMemo(
		() =>
			getProductsToDisplay( {
				duration,
				availableProducts,
				purchasedProducts,
				includedInPlanProducts,
			} ),
		[ duration, availableProducts, includedInPlanProducts, purchasedProducts ]
	);
	const sortedGridItems = useMemo(
		() =>
			sortBy( [ ...plansToDisplay, ...productsToDisplay ], ( item ) =>
				getProductPosition( item.productSlug )
			),
		[ plansToDisplay, productsToDisplay ]
	);
	const isInConnectFlow = useMemo( isConnectionFlow, [] );

	const hasLegacyPlan = currentPlanSlug && JETPACK_LEGACY_PLANS.includes( currentPlanSlug );
	const showJetpackFreeCard = isInConnectFlow || isJetpackCloud();
	const currentPlan = currentPlanSlug && slugToSelectorProduct( currentPlanSlug );

	return (
		<div className="products-grid-alt">
			{ hasLegacyPlan && currentPlan && (
				<ProductCardAlt
					// iconSlug has the same value for all durations.
					// Using this value as a key prevents unnecessary DOM updates.
					key={ currentPlanSlug as string }
					item={ currentPlan }
					onClick={ onSelectProduct }
					siteId={ siteId }
					currencyCode={ currencyCode }
					selectedTerm={ duration }
				/>
			) }

			{ sortedGridItems.map( ( product ) => (
				<ProductCardAlt
					// iconSlug has the same value for all durations.
					// Using this value as a key prevents unnecessary DOM updates.
					key={ product.iconSlug }
					item={ product }
					onClick={ onSelectProduct }
					siteId={ siteId }
					currencyCode={ currencyCode }
					selectedTerm={ duration }
				/>
			) ) }

			{ showJetpackFreeCard && siteId && (
				<JetpackFreeCard siteId={ siteId } urlQueryArgs={ urlQueryArgs } />
			) }
		</div>
	);
};

export default ProductsGridAlt;
