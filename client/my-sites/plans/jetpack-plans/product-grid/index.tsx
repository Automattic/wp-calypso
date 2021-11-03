import {
	PLAN_JETPACK_FREE,
	JETPACK_CRM_FREE_PRODUCTS,
	PLAN_JETPACK_SECURITY_DAILY,
	PLAN_JETPACK_SECURITY_DAILY_MONTHLY,
	PLAN_JETPACK_SECURITY_T1_YEARLY,
	PLAN_JETPACK_SECURITY_T1_MONTHLY,
	PLAN_JETPACK_SECURITY_T2_YEARLY,
	PLAN_JETPACK_SECURITY_T2_MONTHLY,
} from '@automattic/calypso-products';
import classNames from 'classnames';
import { useTranslate } from 'i18n-calypso';
import { useMemo, useRef, useState, useEffect } from 'react';
import * as React from 'react';
import { useSelector } from 'react-redux';
import StoreFooter from 'calypso/jetpack-connect/store-footer';
import isJetpackCloud from 'calypso/lib/jetpack/is-jetpack-cloud';
import { getCurrentUserCurrencyCode } from 'calypso/state/currency-code/selectors';
import getSitePlan from 'calypso/state/sites/selectors/get-site-plan';
import getSelectedSiteId from 'calypso/state/ui/selectors/get-selected-site-id';
import { FootnotesList } from '../footnotes-list';
import { getForCurrentCROIteration, Iterations } from '../iterations';
import JetpackCrmFreeCard from '../jetpack-crm-free-card';
import JetpackFreeCard from '../jetpack-free-card';
import MoreInfoBox from '../more-info-box';
import PlanUpgradeSection from '../plan-upgrade';
import PlansFilterBar from '../plans-filter-bar';
import ProductCard from '../product-card';
import { getProductPosition } from '../product-grid/products-order';
import useGetPlansGridProducts from '../use-get-plans-grid-products';
import ProductGridSection from './section';
import { getPlansToDisplay, getProductsToDisplay, isConnectionFlow } from './utils';
import type { ProductsGridProps, SelectorProduct } from '../types';
import type { JetpackProductSlug, JetpackPlanSlug } from '@automattic/calypso-products';
import type { AppState } from 'calypso/types';

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
	const {
		shouldWrap: shouldWrapOtherItems,
		gridRef: otherItemsGridRef,
	} = useWrapGridForSmallScreens( 3 );
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

	const featuredPlans = getForCurrentCROIteration( {
		[ Iterations.ONLY_REALTIME_PRODUCTS ]: [
			PLAN_JETPACK_SECURITY_T1_YEARLY,
			PLAN_JETPACK_SECURITY_T1_MONTHLY,
			PLAN_JETPACK_SECURITY_T2_YEARLY,
			PLAN_JETPACK_SECURITY_T2_MONTHLY,
		],
	} ) ?? [ PLAN_JETPACK_SECURITY_DAILY, PLAN_JETPACK_SECURITY_DAILY_MONTHLY ];

	const getJetpackFreeCard = () => {
		if ( ! showFreeCard ) {
			return undefined;
		}

		const card = <JetpackFreeCard siteId={ siteId } urlQueryArgs={ urlQueryArgs } />;
		return (
			getForCurrentCROIteration( {
				[ Iterations.ONLY_REALTIME_PRODUCTS ]: card,
			} ) ?? (
				<div
					className={ classNames( 'product-grid__free', {
						[ 'horizontal-layout' ]: ! shouldWrapOtherItems,
					} ) }
				>
					{ card }
				</div>
			)
		);
	};

	const getOtherItemsProductCard = ( product: SelectorProduct ) => {
		if ( PLAN_JETPACK_FREE === product.productSlug ) {
			return showFreeCard ? (
				<li key={ product.productSlug }>{ getJetpackFreeCard() }</li>
			) : undefined;
		}

		if ( JETPACK_CRM_FREE_PRODUCTS.includes( product.productSlug ) ) {
			return (
				<li key={ product.productSlug }>
					<JetpackCrmFreeCard
						fullWidth={ ! showFreeCard }
						siteId={ siteId }
						duration={ duration }
					/>
				</li>
			);
		}

		return (
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
		);
	};

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
			</ProductGridSection>
			<ProductGridSection title={ translate( 'More Products' ) }>
				{ getForCurrentCROIteration( {
					[ Iterations.ONLY_REALTIME_PRODUCTS ]: (
						<>
							<ul className="product-grid__product-grid" ref={ otherItemsGridRef }>
								{ otherItems
									.slice( 0, shouldWrapOtherItems ? undefined : 3 )
									.map( getOtherItemsProductCard ) }
							</ul>
							{ ! shouldWrapOtherItems && (
								<>
									<ul className="product-grid__product-grid second-grid">
										{ otherItems.slice( 3, 5 ).map( getOtherItemsProductCard ) }
									</ul>
									{ getJetpackFreeCard() }
								</>
							) }
						</>
					),
				} ) ?? (
					<>
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
						<div className="product-grid__free add-top-margin">
							{ showFreeCard && (
								<JetpackFreeCard siteId={ siteId } urlQueryArgs={ urlQueryArgs } />
							) }
							<JetpackCrmFreeCard
								fullWidth={ ! showFreeCard }
								siteId={ siteId }
								duration={ duration }
							/>
						</div>
					</>
				) }
			</ProductGridSection>
			<StoreFooter />
			<FootnotesList />
		</>
	);
};

export default ProductGrid;
