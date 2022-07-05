import config from '@automattic/calypso-config';
import {
	PLAN_JETPACK_SECURITY_T1_YEARLY,
	PLAN_JETPACK_SECURITY_T1_MONTHLY,
	PLAN_JETPACK_SECURITY_T2_YEARLY,
	PLAN_JETPACK_SECURITY_T2_MONTHLY,
	JETPACK_BOOST_PRODUCTS,
	JETPACK_PERFORMANCE_CATEGORY,
	JETPACK_SECURITY_CATEGORY,
	JETPACK_GROWTH_CATEGORY,
} from '@automattic/calypso-products';
import { useDesktopBreakpoint } from '@automattic/viewport-react';
import classNames from 'classnames';
import { useTranslate } from 'i18n-calypso';
import { useMemo, useRef, useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import IntroPricingBanner from 'calypso/components/jetpack/intro-pricing-banner';
import StoreFooter from 'calypso/jetpack-connect/store-footer';
import isJetpackCloud from 'calypso/lib/jetpack/is-jetpack-cloud';
import { PLAN_COMPARISON_PAGE } from 'calypso/my-sites/plans/jetpack-plans/constants';
import { getCurrentUserCurrencyCode } from 'calypso/state/currency-code/selectors';
import getCurrentRoute from 'calypso/state/selectors/get-current-route';
import getSitePlan from 'calypso/state/sites/selectors/get-site-plan';
import getSelectedSiteId from 'calypso/state/ui/selectors/get-selected-site-id';
import CategoryFilter from '../category-filter';
import JetpackBoostFreeCard from '../jetpack-boost-free-card';
import JetpackCrmFreeCard from '../jetpack-crm-free-card';
import JetpackFreeCard from '../jetpack-free-card';
import JetpackSocialFreeCard from '../jetpack-social-free-card';
import MoreInfoBox from '../more-info-box';
import PlanUpgradeSection from '../plan-upgrade';
import PlansFilterBar from '../plans-filter-bar';
import ProductCard from '../product-card';
import { getProductPosition } from '../product-grid/products-order';
import useGetPlansGridProducts from '../use-get-plans-grid-products';
import ProductGridSection from './section';
import { getPlansToDisplay, getProductsToDisplay, isConnectionFlow } from './utils';
import type { ProductsGridProps, SelectorProduct } from '../types';
import type {
	JetpackProductSlug,
	JetpackPlanSlug,
	JetpackProductCategory,
} from '@automattic/calypso-products';
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
	isLoadingUpsellPageExperiment,
} ) => {
	const translate = useTranslate();
	const isDesktop = useDesktopBreakpoint();
	const showProductCategories = ! isDesktop;

	const showAnnualPlansOnly = config.isEnabled( 'jetpack/pricing-page-annual-only' );
	const showBoostAndSocialFree = config.isEnabled( 'jetpack/pricing-add-boost-social' );

	const [ category, setCategory ] = useState< JetpackProductCategory >();
	const onCategoryChange = useCallback( setCategory, [ setCategory ] );

	const siteId = useSelector( getSelectedSiteId );
	const currencyCode = useSelector( getCurrentUserCurrencyCode );
	const currentPlan = useSelector( ( state ) => getSitePlan( state, siteId ) );
	const currentPlanSlug = currentPlan?.product_slug || null;
	const currentRoute = useSelector( getCurrentRoute );

	const isStoreLanding =
		currentRoute === '/jetpack/connect/store' ||
		currentRoute.match( new RegExp( '^/jetpack/connect/plans/[^/]+/?(monthly|annual)?$' ) );

	// Retrieve and cache the plans array, which might be already translated.
	useEffect( () => {
		// Get the first plan description and pass it through `translate` so that
		// if it wasn't translated at the start the cache key for sortedPlans
		// would change once translation becomes available, but if it was translated
		// from the start the call to `translate` won't have any effect on it.
		const oneUntranslatedPlan = getPlansToDisplay( { duration, currentPlanSlug } )?.[ 0 ];

		if ( oneUntranslatedPlan?.description ) {
			// eslint-disable-next-line wpcalypso/i18n-no-variables
			translate( String( oneUntranslatedPlan.description ) );
		}

		if ( oneUntranslatedPlan?.features?.items?.[ 0 ]?.text ) {
			// eslint-disable-next-line wpcalypso/i18n-no-variables
			translate( String( oneUntranslatedPlan.features.items[ 0 ]?.text ) );
		}
	}, [ duration, currentPlanSlug, translate ] );

	const { shouldWrap: shouldWrapGrid, gridRef } = useWrapGridForSmallScreens( 3 );
	const { availableProducts, purchasedProducts, includedInPlanProducts } =
		useGetPlansGridProducts( siteId );
	const siteHasBoostPremium = purchasedProducts.some( ( product ) =>
		( JETPACK_BOOST_PRODUCTS as ReadonlyArray< string > ).includes( product.productSlug )
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
	const filteredItems =
		showProductCategories && category
			? otherItems.filter( ( { categories } ) => categories?.includes( category ) )
			: otherItems;

	const showFreeCard = useSelector( getShowFreeCard );

	const filterBar = useMemo(
		() =>
			showAnnualPlansOnly ? null : (
				<div className="product-grid__filter-bar">
					<PlansFilterBar
						showDiscountMessage
						onDurationChange={ onDurationChange }
						duration={ duration }
					/>
				</div>
			),
		[ onDurationChange, duration, showAnnualPlansOnly ]
	);

	const featuredPlans = [
		PLAN_JETPACK_SECURITY_T1_YEARLY,
		PLAN_JETPACK_SECURITY_T1_MONTHLY,
		PLAN_JETPACK_SECURITY_T2_YEARLY,
		PLAN_JETPACK_SECURITY_T2_MONTHLY,
	];

	const getOtherItemsProductCard = ( product: SelectorProduct ) => (
		<li key={ product.iconSlug }>
			<ProductCard
				item={ product }
				onClick={ onSelectProduct }
				siteId={ siteId }
				currencyCode={ currencyCode }
				selectedTerm={ duration }
				scrollCardIntoView={ scrollCardIntoView }
				createButtonURL={ createButtonURL }
				collapseFeaturesOnMobile
				isLoadingUpsellPageExperiment={ isLoadingUpsellPageExperiment }
			/>
		</li>
	);

	const showFourColumnGrid =
		config.isEnabled( 'jetpack/pricing-add-boost-social' ) &&
		( isJetpackCloud() || isStoreLanding );

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
			<ProductGridSection>
				{ ! planRecommendation && filterBar }
				<div className="product-grid__pricing-banner">
					<IntroPricingBanner
						productSlugs={ [
							...popularItems.map( ( { productSlug } ) => productSlug ),
							...otherItems.map( ( { productSlug } ) => productSlug ),
						] }
						siteId={ siteId ?? 'none' }
					/>
				</div>
				<ul
					className={ classNames( 'product-grid__plan-grid', {
						'is-wrapping': shouldWrapGrid,
						'has-top-padding': showAnnualPlansOnly,
					} ) }
					ref={ gridRef }
				>
					{ popularItems.map( ( product ) => {
						const isFeatured = featuredPlans && featuredPlans.includes( product.productSlug );

						return (
							<li
								className={ classNames( {
									'is-featured': isFeatured,
								} ) }
								key={ product.iconSlug }
							>
								<ProductCard
									item={ product }
									onClick={ onSelectProduct }
									siteId={ siteId }
									currencyCode={ currencyCode }
									selectedTerm={ duration }
									isAligned={ ! shouldWrapGrid }
									isFeatured={ isFeatured }
									scrollCardIntoView={ scrollCardIntoView }
									createButtonURL={ createButtonURL }
									isLoadingUpsellPageExperiment={ isLoadingUpsellPageExperiment }
								/>
							</li>
						);
					} ) }
				</ul>
				<div
					className={ classNames( 'product-grid__more', 'product-grid__more-container', {
						'is-detached': shouldWrapGrid,
					} ) }
				>
					<h3 className="product-grid__more-headline">{ translate( 'Need more info?' ) }</h3>
					<MoreInfoBox
						buttonLabel={ translate( 'Compare all product bundles' ) }
						buttonLink={ PLAN_COMPARISON_PAGE }
						track="calypso_plans_comparison_table_link_click"
					/>
				</div>
			</ProductGridSection>
			<div className={ classNames( { 'product-grid__fullwidth-wrapper': showFourColumnGrid } ) }>
				<ProductGridSection
					title={ translate( 'More Products' ) }
					{ ...( showFourColumnGrid && { className: 'product-grid__wide-grid' } ) }
				>
					<>
						{ showProductCategories && (
							<div className="product-grid__category-filter">
								<CategoryFilter
									defaultValue={ JETPACK_SECURITY_CATEGORY }
									onChange={ onCategoryChange }
								/>
							</div>
						) }
						<ul className="product-grid__product-grid">
							{ filteredItems.map( getOtherItemsProductCard ) }
							{ ( ! showProductCategories || category === JETPACK_PERFORMANCE_CATEGORY ) &&
								showBoostAndSocialFree &&
								! siteHasBoostPremium && (
									<li>
										<JetpackBoostFreeCard siteId={ siteId } />
									</li>
								) }
							{ ( ! showProductCategories || category === JETPACK_GROWTH_CATEGORY ) && (
								<>
									{ showBoostAndSocialFree && (
										<li>
											<JetpackSocialFreeCard siteId={ siteId } />
										</li>
									) }
									<li>
										<JetpackCrmFreeCard siteId={ siteId } duration={ duration } />
									</li>
								</>
							) }
							{ showFreeCard && (
								<li>
									<JetpackFreeCard siteId={ siteId } urlQueryArgs={ urlQueryArgs } />
								</li>
							) }
						</ul>
					</>
				</ProductGridSection>
			</div>
			<StoreFooter />
		</>
	);
};

export default ProductGrid;
