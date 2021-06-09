/**
 * External dependencies
 */
import classNames from 'classnames';
import { useTranslate } from 'i18n-calypso';
import React, { useMemo, useRef, useState, useEffect, useCallback, RefObject } from 'react';
import { useSelector } from 'react-redux';

/**
 * Internal dependencies
 */
import ProductGridSection from './section';
import PlansFilterBar from '../plans-filter-bar';
import PlanUpgradeSection from '../plan-upgrade';
import ProductCard from '../product-card';
import { getProductPosition } from '../product-grid/products-order';
import { getPlansToDisplay, getProductsToDisplay, isConnectionFlow } from './utils';
import useGetPlansGridProducts from '../use-get-plans-grid-products';
import JetpackFreeCard from 'calypso/components/jetpack/card/jetpack-free-card';
import isJetpackCloud from 'calypso/lib/jetpack/is-jetpack-cloud';
import {
	PLAN_JETPACK_SECURITY_DAILY,
	PLAN_JETPACK_SECURITY_DAILY_MONTHLY,
} from '@automattic/calypso-products';
import { getCurrentUserCurrencyCode } from 'calypso/state/current-user/selectors';
import getSitePlan from 'calypso/state/sites/selectors/get-site-plan';
import getSelectedSiteId from 'calypso/state/ui/selectors/get-selected-site-id';
import MoreInfoBox from '../more-info-box';
import StoreFooter from 'calypso/jetpack-connect/store-footer';

/**
 * Type dependencies
 */
import type { ProductsGridProps, SelectorProduct } from '../types';
import type { JetpackProductSlug, JetpackPlanSlug } from '@automattic/calypso-products';

/**
 * Style dependencies
 */
import './style.scss';

const sortByGridPosition = ( items: SelectorProduct[] ) =>
	items
		.map( ( i ): [ number, SelectorProduct ] => [
			getProductPosition( i.productSlug as JetpackPlanSlug | JetpackProductSlug ),
			i,
		] )
		.sort( ( [ aPosition ], [ bPosition ] ) => aPosition - bPosition )
		.map( ( [ , item ] ) => item );

const ProductGrid: React.FC< ProductsGridProps > = ( {
	duration,
	urlQueryArgs,
	planRecommendation,
	onSelectProduct,
	onDurationChange,
	scrollCardIntoView,
} ) => {
	const translate = useTranslate();

	const bundleComparisonRef = useRef< null | HTMLElement >( null );
	const planGridRef: RefObject< HTMLUListElement > = useRef( null );
	const [ isPlanRowWrapping, setPlanRowWrapping ] = useState( false );

	const siteId = useSelector( getSelectedSiteId );
	// If a site is passed by URL and the site is found in the app's state, we will assume the site
	// is connected, and thus, we don't need to show the Jetpack Free card.
	const isSiteInContext = !! siteId;
	const currencyCode = useSelector( getCurrentUserCurrencyCode );
	const currentPlan = useSelector( ( state ) => getSitePlan( state, siteId ) );
	const currentPlanSlug = currentPlan?.product_slug || null;

	const { availableProducts, purchasedProducts, includedInPlanProducts } = useGetPlansGridProducts(
		siteId
	);

	const isInConnectFlow = useMemo( isConnectionFlow, [] );
	const isInJetpackCloud = useMemo( isJetpackCloud, [] );
	// Retrieve and cache the plans array, which might be already translated.
	const untranslatedSortedPlans = useMemo(
		() => sortByGridPosition( getPlansToDisplay( { duration, currentPlanSlug } ) ),
		[ duration, currentPlanSlug ]
	);
	// Get the first plan description and pass it through `translate` so that
	// if it wasn't translated at the start the cache key for sortedPlans
	// would change once translation becomes available, but if it was translated
	// from the start the call to `translate` won't have any effect on it.
	const translatedFirstPlanDescription = untranslatedSortedPlans?.[ 0 ]?.description
		? // eslint-disable-next-line wpcalypso/i18n-no-variables
		  translate( untranslatedSortedPlans[ 0 ].description )
		: null;
	const translatedFirstPlanFirstFeature = untranslatedSortedPlans?.[ 0 ]?.features?.items?.[ 0 ]
		?.text
		? // eslint-disable-next-line wpcalypso/i18n-no-variables
		  translate( untranslatedSortedPlans[ 0 ].features.items[ 0 ].text )
		: null;

	const sortedPlans = useMemo(
		() => sortByGridPosition( getPlansToDisplay( { duration, currentPlanSlug } ) ),
		[ duration, currentPlanSlug, translatedFirstPlanDescription, translatedFirstPlanFirstFeature ]
	);
	const sortedProducts = useMemo(
		() =>
			sortByGridPosition(
				getProductsToDisplay( {
					duration,
					availableProducts,
					purchasedProducts,
					includedInPlanProducts,
				} )
			),
		[ duration, availableProducts, includedInPlanProducts, purchasedProducts ]
	);

	let popularProducts = [] as SelectorProduct[];
	let otherProducts = [] as SelectorProduct[];

	const allProducts = sortByGridPosition( [ ...sortedPlans, ...sortedProducts ] );
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

	const filterBar = (
		<div className="product-grid__filter-bar">
			<PlansFilterBar
				showDiscountMessage
				onDurationChange={ onDurationChange }
				duration={ duration }
			/>
		</div>
	);

	return (
		<>
			{ planRecommendation && (
				<PlanUpgradeSection
					planRecommendation={ planRecommendation }
					duration={ duration }
					filterBar={ filterBar }
					onSelectProduct={ onSelectProduct }
				/>
			) }
			<ProductGridSection title={ translate( 'Most Popular' ) }>
				{ ! planRecommendation && filterBar }
				<ul
					className={ classNames( 'product-grid__plan-grid', {
						'is-wrapping': isPlanRowWrapping,
					} ) }
					ref={ planGridRef }
				>
					{ popularProducts.map( ( product ) => (
						<li key={ product.iconSlug }>
							<ProductCard
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
								scrollCardIntoView={ scrollCardIntoView }
							/>
						</li>
					) ) }
				</ul>
				<div
					className={ classNames( 'product-grid__more', {
						'is-detached': isPlanRowWrapping,
					} ) }
				>
					<MoreInfoBox
						headline={ translate( 'Need more info?' ) }
						buttonLabel={ translate( 'Compare all product bundles' ) }
						onButtonClick={ scrollToComparison }
					/>
				</div>
				<ul className="product-grid__asterisk-list">
					<li className="product-grid__asterisk-item">
						{ translate( 'Special introductory pricing, all renewals are at full price.' ) }
					</li>
					<li className="product-grid__asterisk-item">
						{ translate( 'Monthly plans are 7-day money back guarantee.' ) }
					</li>
					<li className="product-grid__asterisk-item">
						{ translate( 'All paid products and plans include priority support.' ) }
					</li>
				</ul>
			</ProductGridSection>
			<ProductGridSection title={ translate( 'More Products' ) }>
				<ul className="product-grid__product-grid">
					{ otherProducts.map( ( product ) => (
						<li key={ product.iconSlug }>
							<ProductCard
								item={ product }
								onClick={ onSelectProduct }
								siteId={ siteId }
								currencyCode={ currencyCode }
								selectedTerm={ duration }
								scrollCardIntoView={ scrollCardIntoView }
							/>
						</li>
					) ) }
				</ul>
				<div className="product-grid__free">
					{ ( isInConnectFlow || ( isInJetpackCloud && ! isSiteInContext ) ) && (
						<JetpackFreeCard siteId={ siteId } urlQueryArgs={ urlQueryArgs } />
					) }
				</div>
			</ProductGridSection>
			<StoreFooter />
		</>
	);
};

export default ProductGrid;
