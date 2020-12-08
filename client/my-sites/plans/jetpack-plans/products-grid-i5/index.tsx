/**
 * External dependencies
 */
import classNames from 'classnames';
import { sortBy } from 'lodash';
import { useTranslate } from 'i18n-calypso';
import React, { useMemo, useRef, useState, useEffect, useCallback, RefObject } from 'react';
import { useSelector } from 'react-redux';

/**
 * Internal dependencies
 */
import { SWITCH_PLAN_SIDES_EXPERIMENT } from '../experiments';
import PlansFilterBarI5 from '../plans-filter-bar-i5';
import ProductCardI5 from '../product-card-i5';
import { getProductPosition } from '../product-grid/products-order';
import { getPlansToDisplay, getProductsToDisplay, isConnectionFlow } from '../product-grid/utils';
import useGetPlansGridProducts from '../use-get-plans-grid-products';
import Experiment from 'calypso/components/experiment';
import JetpackFreeCard from 'calypso/components/jetpack/card/jetpack-free-card-i5';
import isJetpackCloud from 'calypso/lib/jetpack/is-jetpack-cloud';
import {
	PLAN_JETPACK_SECURITY_REALTIME,
	PLAN_JETPACK_SECURITY_REALTIME_MONTHLY,
} from 'calypso/lib/plans/constants';
import { getCurrentUserCurrencyCode } from 'calypso/state/current-user/selectors';
import { getVariationForUser, isLoading } from 'calypso/state/experiments/selectors';
import getSitePlan from 'calypso/state/sites/selectors/get-site-plan';
import getSelectedSiteId from 'calypso/state/ui/selectors/get-selected-site-id';
import MoreInfoBox from '../more-info-box';
import StoreFooter from 'calypso/jetpack-connect/store-footer';

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
	onDurationChange,
} ) => {
	const translate = useTranslate();

	const bundleComparisonRef = useRef< null | HTMLElement >( null );
	const planGridRef: RefObject< HTMLUListElement > = useRef( null );
	const [ isPlanRowWrapping, setPlanRowWrapping ] = useState( false );

	const siteId = useSelector( getSelectedSiteId );
	const currencyCode = useSelector( getCurrentUserCurrencyCode );
	const currentPlanSlug =
		useSelector( ( state ) => getSitePlan( state, siteId ) )?.product_slug || null;
	const variation =
		useSelector( ( state ) => getVariationForUser( state, SWITCH_PLAN_SIDES_EXPERIMENT ) ) || '';
	const isVariationLoading = useSelector( isLoading );

	const { availableProducts, purchasedProducts, includedInPlanProducts } = useGetPlansGridProducts(
		siteId
	);

	const isInConnectFlow = useMemo( isConnectionFlow, [] );
	const isInJetpackCloud = useMemo( isJetpackCloud, [] );
	const sortedPlans = useMemo(
		() =>
			sortBy( getPlansToDisplay( { duration, currentPlanSlug } ), ( item ) =>
				getProductPosition( item.productSlug as JetpackPlanSlugs, variation )
			),
		[ duration, currentPlanSlug, variation ]
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
				( item ) => getProductPosition( item.productSlug as JetpackProductSlug, variation )
			),
		[ duration, availableProducts, includedInPlanProducts, purchasedProducts, variation ]
	);

	const scrollToComparison = () => {
		if ( bundleComparisonRef.current ) {
			bundleComparisonRef.current?.scrollIntoView( {
				behavior: 'smooth',
			} );
		}
	};

	const onResize = useCallback( () => {
		if ( planGridRef ) {
			const { current: grid } = planGridRef;

			if ( grid ) {
				const firstChild = grid.children[ 0 ];

				if ( firstChild instanceof HTMLElement ) {
					const itemCount = Math.round( grid.offsetWidth / firstChild.offsetWidth );

					setPlanRowWrapping( itemCount < sortedPlans.length );
				}
			}
		}
	}, [ planGridRef, sortedPlans ] );

	useEffect( () => {
		onResize();
		window.addEventListener( 'resize', onResize );

		return () => window.removeEventListener( 'resize', onResize );
	}, [ onResize ] );

	return (
		<Experiment name={ SWITCH_PLAN_SIDES_EXPERIMENT }>
			<section className="products-grid-i5__section">
				<h2 className="products-grid-i5__section-title">{ translate( 'Product Bundles' ) }</h2>
				<div className="products-grid-i5__filter-bar">
					<PlansFilterBarI5
						showDiscountMessage
						onDurationChange={ onDurationChange }
						duration={ duration }
					/>
				</div>
				{ ! isVariationLoading && (
					<>
						<ul
							className={ classNames( 'products-grid-i5__plan-grid', {
								'is-wrapping': isPlanRowWrapping,
							} ) }
							ref={ planGridRef }
						>
							{ sortedPlans.map( ( product ) => (
								<li key={ product.iconSlug }>
									<ProductCardI5
										item={ product }
										onClick={ onSelectProduct }
										siteId={ siteId }
										currencyCode={ currencyCode }
										selectedTerm={ duration }
										isAligned={ ! isPlanRowWrapping }
										featuredPlans={ [
											PLAN_JETPACK_SECURITY_REALTIME,
											PLAN_JETPACK_SECURITY_REALTIME_MONTHLY,
										] }
									/>
								</li>
							) ) }
						</ul>
						<div
							className={ classNames( 'products-grid-i5__more', {
								'is-detached': isPlanRowWrapping,
							} ) }
						>
							<MoreInfoBox
								headline={ translate( 'Need more info?' ) }
								buttonLabel={ translate( 'Compare all product bundles' ) }
								onButtonClick={ scrollToComparison }
							/>
						</div>
					</>
				) }
			</section>
			<section className="products-grid-i5__section">
				<h2 className="products-grid-i5__section-title">{ translate( 'Individual Products' ) }</h2>
				{ ! isVariationLoading && (
					<ul className="products-grid-i5__product-grid">
						{ sortedProducts.map( ( product ) => (
							<li key={ product.iconSlug }>
								<ProductCardI5
									item={ product }
									onClick={ onSelectProduct }
									siteId={ siteId }
									currencyCode={ currencyCode }
									selectedTerm={ duration }
								/>
							</li>
						) ) }
					</ul>
				) }
				<div className="products-grid-i5__free">
					{ ( isInConnectFlow || isInJetpackCloud ) && (
						<JetpackFreeCard siteId={ siteId } urlQueryArgs={ urlQueryArgs } />
					) }
				</div>
			</section>
			{ ! isJetpackCloud() && <StoreFooter /> }
		</Experiment>
	);
};

export default ProductsGridI5;
