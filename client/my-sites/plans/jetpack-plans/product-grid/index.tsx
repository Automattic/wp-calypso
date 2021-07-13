/**
 * External dependencies
 */
import classNames from 'classnames';
import { useTranslate } from 'i18n-calypso';
import React, { useMemo, useRef, useState, useEffect } from 'react';
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
import { getForCurrentCROIteration, Iterations } from '../iterations';
import useGetPlansGridProducts from '../use-get-plans-grid-products';
import JetpackFreeCard from '../jetpack-free-card';
import JetpackCrmFreeCard from '../jetpack-crm-free-card';
import isJetpackCloud from 'calypso/lib/jetpack/is-jetpack-cloud';
import {
	PLAN_JETPACK_SECURITY_DAILY,
	PLAN_JETPACK_SECURITY_DAILY_MONTHLY,
	PLAN_JETPACK_SECURITY,
	PLAN_JETPACK_SECURITY_MONTHLY,
} from '@automattic/calypso-products';
import { getCurrentUserCurrencyCode } from 'calypso/state/currency-code/selectors';
import getSitePlan from 'calypso/state/sites/selectors/get-site-plan';
import getSelectedSiteId from 'calypso/state/ui/selectors/get-selected-site-id';
import MoreInfoBox from '../more-info-box';
import StoreFooter from 'calypso/jetpack-connect/store-footer';

/**
 * Type dependencies
 */
import type { AppState } from 'calypso/types';
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

const getShowFreeCard = ( state: AppState ) => {
	if ( isConnectionFlow() ) {
		return true;
	}

	// If a site is passed by URL and the site is found in the app's state, we will assume the site
	// is connected, and thus, we don't need to show the Jetpack Free card.
	const siteId = getSelectedSiteId( state );
	if ( siteId ) {
		return false;
	}

	return isJetpackCloud();
};

const useWrapGridForSmallScreens = ( maxItemsPerRow: number ) => {
	const gridRef = useRef< HTMLUListElement >( null );
	const [ shouldWrap, setShouldWrap ] = useState< boolean >( false );

	useEffect( () => {
		const onResize = () => {
			const { current: grid } = gridRef;
			if ( ! grid ) {
				return;
			}

			const firstChild = grid.children[ 0 ];

			if ( firstChild instanceof HTMLElement ) {
				const possibleItemsPerRow = Math.round( grid.offsetWidth / firstChild.offsetWidth );

				setShouldWrap( possibleItemsPerRow < maxItemsPerRow );
			}
		};

		onResize();
		window.addEventListener( 'resize', onResize );

		return () => window.removeEventListener( 'resize', onResize );
	}, [ maxItemsPerRow ] );

	return { shouldWrap, gridRef };
};

const ProductGrid: React.FC< ProductsGridProps > = ( {
	duration,
	urlQueryArgs,
	planRecommendation,
	onSelectProduct,
	onDurationChange,
	scrollCardIntoView,
	createButtonURL,
} ) => {
	const translate = useTranslate();

	const siteId = useSelector( getSelectedSiteId );
	const currencyCode = useSelector( getCurrentUserCurrencyCode );
	const currentPlan = useSelector( ( state ) => getSitePlan( state, siteId ) );
	const currentPlanSlug = currentPlan?.product_slug || null;

	// Retrieve and cache the plans array, which might be already translated.
	useEffect( () => {
		// Get the first plan description and pass it through `translate` so that
		// if it wasn't translated at the start the cache key for sortedPlans
		// would change once translation becomes available, but if it was translated
		// from the start the call to `translate` won't have any effect on it.
		const oneUntranslatedPlan = getPlansToDisplay( { duration, currentPlanSlug } )?.[ 0 ];

		if ( oneUntranslatedPlan?.description ) {
			// eslint-disable-next-line wpcalypso/i18n-no-variables
			translate( oneUntranslatedPlan.description );
		}

		if ( oneUntranslatedPlan?.features?.items?.[ 0 ]?.text ) {
			// eslint-disable-next-line wpcalypso/i18n-no-variables
			translate( oneUntranslatedPlan.features.items[ 0 ]?.text );
		}
	}, [ duration, currentPlanSlug, translate ] );

	const { shouldWrap: shouldWrapGrid, gridRef } = useWrapGridForSmallScreens( 3 );
	const { availableProducts, purchasedProducts, includedInPlanProducts } = useGetPlansGridProducts(
		siteId
	);
	const [ popularItems, otherItems ] = useMemo( () => {
		const allItems = sortByGridPosition( [
			...getProductsToDisplay( {
				duration,
				availableProducts,
				purchasedProducts,
				includedInPlanProducts,
			} ),
			...getPlansToDisplay( { duration, currentPlanSlug } ),
		] );

		return [ allItems.slice( 0, 3 ), allItems.slice( 3 ) ];
	}, [ duration, availableProducts, purchasedProducts, includedInPlanProducts, currentPlanSlug ] );

	const showFreeCard = useSelector( getShowFreeCard );
	const showCrmFreeCard =
		getForCurrentCROIteration( {
			[ Iterations.ONLY_REALTIME_PRODUCTS ]: true,
		} ) ?? false;

	const bundleComparisonRef = useRef< null | HTMLElement >( null );
	const scrollToComparison = () => {
		if ( bundleComparisonRef.current ) {
			bundleComparisonRef.current?.scrollIntoView( {
				behavior: 'smooth',
			} );
		}
	};

	const filterBar = useMemo(
		() => (
			<div className="product-grid__filter-bar">
				<PlansFilterBar
					showDiscountMessage
					onDurationChange={ onDurationChange }
					duration={ duration }
				/>
			</div>
		),
		[ onDurationChange, duration ]
	);

	const featuredPlans = getForCurrentCROIteration( ( key ) => {
		return Iterations.ONLY_REALTIME_PRODUCTS === key
			? [ PLAN_JETPACK_SECURITY, PLAN_JETPACK_SECURITY_MONTHLY ]
			: [ PLAN_JETPACK_SECURITY_DAILY, PLAN_JETPACK_SECURITY_DAILY_MONTHLY ];
	} );

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
						'is-wrapping': shouldWrapGrid,
					} ) }
					ref={ gridRef }
				>
					{ popularItems.map( ( product ) => (
						<li key={ product.iconSlug }>
							<ProductCard
								item={ product }
								onClick={ onSelectProduct }
								siteId={ siteId }
								currencyCode={ currencyCode }
								selectedTerm={ duration }
								isAligned={ ! shouldWrapGrid }
								featuredPlans={ featuredPlans }
								scrollCardIntoView={ scrollCardIntoView }
								createButtonURL={ createButtonURL }
							/>
						</li>
					) ) }
				</ul>
				<div
					className={ classNames( 'product-grid__more', {
						'is-detached': shouldWrapGrid,
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
					{ otherItems.map( ( product ) => (
						<li key={ product.iconSlug }>
							<ProductCard
								item={ product }
								onClick={ onSelectProduct }
								siteId={ siteId }
								currencyCode={ currencyCode }
								selectedTerm={ duration }
								scrollCardIntoView={ scrollCardIntoView }
								createButtonURL={ createButtonURL }
							/>
						</li>
					) ) }
				</ul>
				<div className="product-grid__free">
					{ showCrmFreeCard && (
						<JetpackCrmFreeCard
							fullWidth={ ! showFreeCard }
							siteId={ siteId }
							duration={ duration }
						/>
					) }
					{ showFreeCard && (
						<JetpackFreeCard
							fullWidth={ ! showCrmFreeCard }
							siteId={ siteId }
							urlQueryArgs={ urlQueryArgs }
						/>
					) }
				</div>
			</ProductGridSection>
			<StoreFooter />
		</>
	);
};

export default ProductGrid;
