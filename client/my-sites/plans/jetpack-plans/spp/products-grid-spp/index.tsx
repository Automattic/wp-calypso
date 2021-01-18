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
import {
	SWITCH_PLAN_SIDES_EXPERIMENT,
	SWITCH_PLAN_SIDES_TREATMENT,
} from 'calypso/my-sites/plans/jetpack-plans/experiments';
import PlansFilterBarI5 from 'calypso/my-sites/plans/jetpack-plans/i5/plans-filter-bar-i5';
import ProductCardI5 from 'calypso/my-sites/plans/jetpack-plans/i5/product-card-i5';
import { getProductPosition } from 'calypso/my-sites/plans/jetpack-plans/product-grid/products-order';
import {
	getPlansToDisplay,
	getProductsToDisplay,
	isConnectionFlow,
} from 'calypso/my-sites/plans/jetpack-plans/product-grid/utils';
import useGetPlansGridProducts from 'calypso/my-sites/plans/jetpack-plans/use-get-plans-grid-products';
import Experiment from 'calypso/components/experiment';
import JetpackFreeCard from 'calypso/components/jetpack/card/spp/jetpack-free-card-spp';
import JetpackCrmFreeCardSPP from 'calypso/components/jetpack/card/spp/jetpack-crm-free-card-spp';
import isJetpackCloud from 'calypso/lib/jetpack/is-jetpack-cloud';
import {
	PLAN_JETPACK_SECURITY_DAILY,
	PLAN_JETPACK_SECURITY_DAILY_MONTHLY,
} from 'calypso/lib/plans/constants';
import { getCurrentUserCurrencyCode } from 'calypso/state/current-user/selectors';
import { getVariationForUser } from 'calypso/state/experiments/selectors';
import getSitePlan from 'calypso/state/sites/selectors/get-site-plan';
import getSelectedSiteId from 'calypso/state/ui/selectors/get-selected-site-id';
import MoreInfoBox from 'calypso/my-sites/plans/jetpack-plans/more-info-box';
import StoreFooter from 'calypso/jetpack-connect/store-footer';
import getSiteId from 'calypso/state/selectors/get-site-id';

/**
 * Type dependencies
 */
import type {
	ProductsGridProps,
	SelectorProduct,
} from 'calypso/my-sites/plans/jetpack-plans/types';
import type { JetpackProductSlug } from 'calypso/lib/products-values/types';
import type { JetpackPlanSlugs } from 'calypso/lib/plans/types';

/**
 * Style dependencies
 */
import './style.scss';

const ProductsGridSpp: React.FC< ProductsGridProps > = ( {
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
	// If a site is passed by URL and the site is found in the app's state, we will assume the site
	// is connected, and thus, we don't need to show the Jetpack Free card.
	const isUrlSiteConnected = useSelector( ( state ) => getSiteId( state, urlQueryArgs?.site ) );
	const currencyCode = useSelector( getCurrentUserCurrencyCode );
	const currentPlanSlug =
		useSelector( ( state ) => getSitePlan( state, siteId ) )?.product_slug || null;
	const exPlatVariation =
		useSelector( ( state ) => getVariationForUser( state, SWITCH_PLAN_SIDES_EXPERIMENT ) ) || '';

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

	let popularProducts = [] as SelectorProduct[];
	let otherProducts = [] as SelectorProduct[];

	const allProducts = sortBy( [ ...sortedPlans, ...sortedProducts ], ( item ) =>
		getProductPosition( item.productSlug as JetpackPlanSlugs | JetpackProductSlug )
	);
	popularProducts = allProducts.slice( 0, 3 );
	otherProducts = allProducts.slice( 3 );

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

					setPlanRowWrapping( itemCount < popularProducts.length );
				}
			}
		}
	}, [ planGridRef, popularProducts ] );

	useEffect( () => {
		onResize();
		window.addEventListener( 'resize', onResize );

		return () => window.removeEventListener( 'resize', onResize );
	}, [ onResize ] );

	const showJetpackFree = isInConnectFlow || ( isInJetpackCloud && ! isUrlSiteConnected );

	return (
		<Experiment name={ SWITCH_PLAN_SIDES_EXPERIMENT }>
			<section className="products-grid-spp__section">
				<h2 className="products-grid-spp__section-title">{ translate( 'Most Popular' ) }</h2>
				<div className="products-grid-spp__filter-bar">
					<PlansFilterBarI5
						showDiscountMessage
						onDurationChange={ onDurationChange }
						duration={ duration }
						withTreatmentVariant={ exPlatVariation === SWITCH_PLAN_SIDES_TREATMENT }
					/>
				</div>
				<ul
					className={ classNames( 'products-grid-spp__plan-grid', {
						'is-wrapping': isPlanRowWrapping,
					} ) }
					ref={ planGridRef }
				>
					{ popularProducts.map( ( product ) => (
						<li key={ product.iconSlug }>
							<ProductCardI5
								item={ product }
								onClick={ onSelectProduct }
								siteId={ siteId }
								currencyCode={ currencyCode }
								selectedTerm={ duration }
								isAligned={ ! isPlanRowWrapping }
								featuredPlans={ [
									PLAN_JETPACK_SECURITY_DAILY,
									PLAN_JETPACK_SECURITY_DAILY_MONTHLY,
								] }
							/>
						</li>
					) ) }
				</ul>
				<div
					className={ classNames( 'products-grid-spp__more', {
						'is-detached': isPlanRowWrapping,
					} ) }
				>
					<MoreInfoBox
						headline={ translate( 'Need more info?' ) }
						buttonLabel={ translate( 'Compare all' ) }
						onButtonClick={ scrollToComparison }
					/>
				</div>
			</section>
			<section className="products-grid-spp__section">
				<h2 className="products-grid-spp__section-title">{ translate( 'More Products' ) }</h2>
				<ul className="products-grid-spp__product-grid">
					{ otherProducts.map( ( product ) => (
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
				<div className="products-grid-spp__free">
					{ showJetpackFree && <JetpackFreeCard siteId={ siteId } urlQueryArgs={ urlQueryArgs } /> }
					<JetpackCrmFreeCardSPP
						className={ classNames( { 'is-full-width': ! showJetpackFree } ) }
						siteId={ siteId }
						urlQueryArgs={ urlQueryArgs }
					/>
				</div>
			</section>
			<StoreFooter />
		</Experiment>
	);
};

export default ProductsGridSpp;
