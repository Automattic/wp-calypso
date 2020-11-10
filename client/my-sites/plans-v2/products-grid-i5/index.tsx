/**
 * External dependencies
 */
import { sortBy } from 'lodash';
import { useTranslate } from 'i18n-calypso';
import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';

/**
 * Internal dependencies
 */
import ProductCardAlt2 from '../product-card-alt-2';
import { getProductPosition } from '../product-grid/products-order';
import { getPlansToDisplay, getProductsToDisplay, isConnectionFlow } from '../product-grid/utils';
import useGetPlansGridProducts from '../use-get-plans-grid-products';
import JetpackFreeCard from 'calypso/components/jetpack/card/jetpack-free-card-alt';
import isJetpackCloud from 'calypso/lib/jetpack/is-jetpack-cloud';
import { getCurrentUserCurrencyCode } from 'calypso/state/current-user/selectors';
import getSitePlan from 'calypso/state/sites/selectors/get-site-plan';
import getSelectedSiteId from 'calypso/state/ui/selectors/get-selected-site-id';

/**
 * Type dependencies
 */
import type { ProductsGridProps } from '../types';
import type { JetpackProductSlug } from 'calypso/lib/products-values/types';
import type { JetpackPlanSlugs } from 'calypso/lib/plans/types';

/**
 * Style dependencies
 */
import './style.scss';

const ProductsGridI5: React.FC< ProductsGridProps > = ( {
	duration,
	onSelectProduct,
	urlQueryArgs,
} ) => {
	const translate = useTranslate();

	const siteId = useSelector( getSelectedSiteId );
	const currencyCode = useSelector( getCurrentUserCurrencyCode );
	const currentPlanSlug =
		useSelector( ( state ) => getSitePlan( state, siteId ) )?.product_slug || null;

	const { availableProducts, purchasedProducts, includedInPlanProducts } = useGetPlansGridProducts(
		siteId
	);

	const isInConnectFlow = useMemo( isConnectionFlow, [] );
	const isInJetpackCloud = useMemo( isJetpackCloud, [] );
	const sortedPlans = useMemo(
		() =>
			sortBy( getPlansToDisplay( { duration, currentPlanSlug } ), ( item ) =>
				getProductPosition( item.productSlug as JetpackPlanSlugs )
			),
		[ duration, currentPlanSlug ]
	);
	const sortedProducts = useMemo(
		() =>
			sortBy(
				getProductsToDisplay( {
					duration,
					availableProducts,
					purchasedProducts,
					includedInPlanProducts,
				} ),
				( item ) => getProductPosition( item.productSlug as JetpackProductSlug )
			),
		[ duration, availableProducts, includedInPlanProducts, purchasedProducts ]
	);

	return (
		<>
			<section className="products-grid-i5__section">
				<h2 className="products-grid-i5__section-title">{ translate( 'Product Bundles' ) }</h2>
				<div className="products-grid-i5__filter-bar"></div>
				<ul className="products-grid-i5__plan-grid">
					{ sortedPlans.map( ( product ) => (
						<li key={ product.iconSlug }>
							<ProductCardAlt2
								item={ product }
								onClick={ onSelectProduct }
								siteId={ siteId }
								currencyCode={ currencyCode }
								selectedTerm={ duration }
							/>
						</li>
					) ) }
				</ul>
				<div className="products-grid-i5__more"></div>
			</section>
			<section className="products-grid-i5__section">
				<h2 className="products-grid-i5__section-title">{ translate( 'Individual Products' ) }</h2>
				<ul className="products-grid-i5__product-grid">
					{ sortedProducts.map( ( product ) => (
						<li key={ product.iconSlug }>
							<ProductCardAlt2
								item={ product }
								onClick={ onSelectProduct }
								siteId={ siteId }
								currencyCode={ currencyCode }
								selectedTerm={ duration }
							/>
						</li>
					) ) }
				</ul>
				<div className="products-grid-i5__free">
					{ ( isInConnectFlow || isInJetpackCloud ) && siteId && (
						<JetpackFreeCard siteId={ siteId } urlQueryArgs={ urlQueryArgs } />
					) }
				</div>
			</section>
			<section className="products-grid-i5__section">
				<h2 className="products-grid-i5__section-title">{ translate( 'Bundle Comparison' ) }</h2>
			</section>
		</>
	);
};

export default ProductsGridI5;
