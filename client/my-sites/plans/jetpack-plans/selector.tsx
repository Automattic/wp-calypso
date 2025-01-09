import { TERM_ANNUALLY } from '@automattic/calypso-products';
import clsx from 'clsx';
import { useEffect, useState, useMemo } from 'react';
import * as React from 'react';
import QueryIntroOffers from 'calypso/components/data/query-intro-offers';
import QueryJetpackSaleCoupon from 'calypso/components/data/query-jetpack-sale-coupon';
import QueryJetpackUserLicenses from 'calypso/components/data/query-jetpack-user-licenses';
import QueryJetpackUserLicensesCounts from 'calypso/components/data/query-jetpack-user-licenses-counts';
import QueryProductsList from 'calypso/components/data/query-products-list';
import QuerySiteProducts from 'calypso/components/data/query-site-products';
import QuerySitePurchases from 'calypso/components/data/query-site-purchases';
import QuerySites from 'calypso/components/data/query-sites';
import Main from 'calypso/components/main';
import { MAIN_CONTENT_ID } from 'calypso/jetpack-cloud/sections/pricing/jpcom-masterbar';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import { useExperiment } from 'calypso/lib/explat';
import isJetpackCloud from 'calypso/lib/jetpack/is-jetpack-cloud';
import CalypsoShoppingCartProvider from 'calypso/my-sites/checkout/calypso-shopping-cart-provider';
import { EXTERNAL_PRODUCTS_LIST } from 'calypso/my-sites/plans/jetpack-plans/constants';
import { useDispatch, useSelector } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions/record';
import { getCurrentUserCurrencyCode } from 'calypso/state/currency-code/selectors';
import { showMasterbar } from 'calypso/state/ui/actions';
import { getSelectedSiteId, getSelectedSiteSlug } from 'calypso/state/ui/selectors';
import { getPurchaseURLCallback } from './get-purchase-url-callback';
import getViewTrackerPath from './get-view-tracker-path';
import { getForCurrentCROIteration, Iterations } from './iterations';
import ProductStore from './product-store';
import type {
	Duration,
	SelectorPageProps,
	SelectorProduct,
	PurchaseCallback,
} from 'calypso/my-sites/plans/jetpack-plans/types';
import './style.scss';

const SelectorPage: React.FC< SelectorPageProps > = ( {
	defaultDuration = TERM_ANNUALLY,
	siteSlug: siteSlugProp,
	rootUrl,
	urlQueryArgs,
	nav,
	header,
	footer,
	locale,
	planRecommendation,
	enableUserLicensesDialog = false,
}: SelectorPageProps ) => {
	const dispatch = useDispatch();

	const siteId = useSelector( getSelectedSiteId );
	const siteSlugState = useSelector( getSelectedSiteSlug ) || '';
	const { unlinked, purchasetoken, purchaseNonce, site, currency: currencyCodeQp } = urlQueryArgs;
	const siteSlug = siteSlugProp || siteSlugState;
	const [ currentDuration, setDuration ] = useState< Duration >( defaultDuration );
	const [ hasRecordedPageView, setHasRecordedPageView ] = useState( false );
	const viewTrackerPath = getViewTrackerPath( rootUrl, siteSlugProp );
	const viewTrackerProps = siteId ? { site: siteSlug } : {};
	const legacyPlan = planRecommendation ? planRecommendation[ 0 ] : null;
	const [ , experimentAssignment ] = useExperiment( 'calypso_jetpack_upsell_page_2022_06' );
	const showUpsellPage = experimentAssignment?.variationName === 'treatment';

	let currencyCode = useSelector( getCurrentUserCurrencyCode );
	if ( currencyCodeQp ) {
		currencyCode = currencyCodeQp;
	}

	useEffect( () => {
		if ( currencyCode && ! hasRecordedPageView ) {
			setHasRecordedPageView( true );
			dispatch(
				recordTracksEvent( 'calypso_jetpack_pricing_page_visit', {
					site: siteSlug,
					path: viewTrackerPath,
					root_path: rootUrl,
					currency: currencyCode,
				} )
			);
		}
	}, [ dispatch, rootUrl, siteSlug, viewTrackerPath, currencyCode, hasRecordedPageView ] );

	useEffect( () => {
		if ( legacyPlan ) {
			dispatch(
				recordTracksEvent( 'calypso_jetpack_pricing_legacy_redirect', {
					site: siteSlug,
					path: viewTrackerPath,
					root_path: rootUrl,
					legacy_plan: legacyPlan,
				} )
			);
		}
	}, [ legacyPlan, dispatch, rootUrl, siteSlug, viewTrackerPath ] );

	const canDoSiteOnlyCheckout = unlinked && !! site && !! ( purchasetoken || purchaseNonce );
	useEffect( () => {
		if ( canDoSiteOnlyCheckout ) {
			dispatch(
				recordTracksEvent( 'calypso_jetpack_siteonly_pricing_page_visit', {
					site: siteSlug,
					path: viewTrackerPath,
					root_path: rootUrl,
					currency: currencyCode,
				} )
			);
		}
	}, [ canDoSiteOnlyCheckout, dispatch, rootUrl, siteSlug, viewTrackerPath, currencyCode ] );

	useEffect( () => {
		setDuration( defaultDuration );
	}, [ defaultDuration ] );

	useEffect(
		() => () => {
			// Show masterbar back when pricing page unmounts, to prevent it from disappearing
			// from the previous page when hitting the browser back button.
			if ( isJetpackCloud() ) {
				dispatch( showMasterbar() );
			}
		},
		[ dispatch ]
	);

	const createProductURL = useMemo(
		() => getPurchaseURLCallback( siteSlug, urlQueryArgs, locale, rootUrl, showUpsellPage ),
		[ siteSlug, urlQueryArgs, locale, rootUrl, showUpsellPage ]
	);

	// Sends a user to a page based on whether there are subtypes.
	const selectProduct: PurchaseCallback = (
		product: SelectorProduct,
		isUpgradeableToYearly = false,
		purchase
	) => {
		const trackingProps = {
			site_id: siteId || undefined,
			product_slug: product.productSlug,
			duration: currentDuration,
			path: viewTrackerPath,
		};

		if ( EXTERNAL_PRODUCTS_LIST.includes( product.productSlug ) ) {
			dispatch( recordTracksEvent( 'calypso_product_external_click', trackingProps ) );
			return;
		}

		if ( purchase && isUpgradeableToYearly ) {
			// Name of `calypso_product_checkout_click` is misleading, since it's only triggered
			// for Jetpack products. Leaving it here to not break current analysis, but please
			// use `calypso_jetpack_pricing_page_product_click` instead when using tracking tools.
			dispatch( recordTracksEvent( 'calypso_product_checkout_click', trackingProps ) );
			dispatch( recordTracksEvent( 'calypso_jetpack_pricing_page_product_click', trackingProps ) );

			return;
		}

		if ( purchase ) {
			dispatch( recordTracksEvent( 'calypso_product_manage_click', trackingProps ) );
			return;
		}

		// Name of `calypso_product_checkout_click` is misleading, since it's only triggered
		// for Jetpack products. Leaving it here to not break current analysis, but please
		// use `calypso_jetpack_pricing_page_product_click` instead when using tracking tools.
		dispatch( recordTracksEvent( 'calypso_product_checkout_click', trackingProps ) );
		dispatch( recordTracksEvent( 'calypso_jetpack_pricing_page_product_click', trackingProps ) );
	};

	const iterationClassName = getForCurrentCROIteration(
		( variation: Iterations | null ) => `jetpack-plans__iteration--${ variation ?? 'default' }`
	);

	return (
		<>
			<QueryJetpackSaleCoupon />
			{ siteId && enableUserLicensesDialog && <QueryJetpackUserLicenses /> }
			{ siteId && enableUserLicensesDialog && <QueryJetpackUserLicensesCounts /> }

			{ nav }

			<Main
				className={ clsx(
					'selector__main',
					iterationClassName,
					'fs-unmask',
					'jetpack-pricing-page-rework-v1'
				) }
				id={ MAIN_CONTENT_ID }
				wideLayout
			>
				<PageViewTracker
					path={ viewTrackerPath }
					properties={ viewTrackerProps }
					title="Plans"
					options={ { useJetpackGoogleAnalytics: isJetpackCloud() } }
				/>

				<CalypsoShoppingCartProvider>
					<ProductStore
						createCheckoutURL={ createProductURL }
						duration={ currentDuration }
						enableUserLicensesDialog={ enableUserLicensesDialog }
						onClickPurchase={ selectProduct }
						urlQueryArgs={ urlQueryArgs }
						header={ header }
						planRecommendation={ planRecommendation }
					/>
				</CalypsoShoppingCartProvider>

				<QueryProductsList type="jetpack" currency={ currencyCode ?? undefined } />
				<QueryIntroOffers siteId={ siteId ?? 'none' } currency={ currencyCode ?? undefined } />
				{ siteId && <QuerySiteProducts siteId={ siteId } /> }
				{ siteId && <QuerySitePurchases siteId={ siteId } /> }
				{ siteId && <QuerySites siteId={ siteId } /> }
			</Main>
			{ footer }
		</>
	);
};

export default SelectorPage;
