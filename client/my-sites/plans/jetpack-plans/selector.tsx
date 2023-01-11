import { TERM_ANNUALLY } from '@automattic/calypso-products';
import classNames from 'classnames';
import { useEffect, useState, useMemo } from 'react';
import * as React from 'react';
import { useDispatch, useSelector } from 'react-redux';
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
import { JPC_PATH_PLANS } from 'calypso/jetpack-connect/constants';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import { useExperiment } from 'calypso/lib/explat';
import isJetpackCloud from 'calypso/lib/jetpack/is-jetpack-cloud';
import { EXTERNAL_PRODUCTS_LIST } from 'calypso/my-sites/plans/jetpack-plans/constants';
import { loadTrackingTool } from 'calypso/state/analytics/actions';
import { recordTracksEvent } from 'calypso/state/analytics/actions/record';
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

	const siteId = useSelector( ( state ) => getSelectedSiteId( state ) );
	const siteSlugState = useSelector( ( state ) => getSelectedSiteSlug( state ) ) || '';
	const siteSlug = siteSlugProp || siteSlugState;
	const [ currentDuration, setDuration ] = useState< Duration >( defaultDuration );
	const viewTrackerPath = getViewTrackerPath( rootUrl, siteSlugProp );
	const viewTrackerProps = siteId ? { site: siteSlug } : {};
	const legacyPlan = planRecommendation ? planRecommendation[ 0 ] : null;

	const [ , experimentAssignment ] = useExperiment( 'calypso_jetpack_upsell_page_2022_06' );
	const showUpsellPage = experimentAssignment?.variationName === 'treatment';

	useEffect( () => {
		if (
			/**
			 * Load the HotJar script on routes 'cloud.jetpack.com/pricing/..' and
			 * 'wordpress.com/jetpack/connect/plans/:site/..' (Jetpack plugin post-conneciton route)
			 */
			isJetpackCloud() ||
			window.location.pathname.startsWith( JPC_PATH_PLANS )
		) {
			// HotJar analytics tracking
			// https://github.com/Automattic/wp-calypso/blob/trunk/client/state/analytics/README_HotJar.md
			dispatch( loadTrackingTool( 'HotJar' ) );
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [] );

	useEffect( () => {
		dispatch(
			recordTracksEvent( 'calypso_jetpack_pricing_page_visit', {
				site: siteSlug,
				path: viewTrackerPath,
				root_path: rootUrl,
			} )
		);
	}, [ dispatch, rootUrl, siteSlug, viewTrackerPath ] );

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

	const { unlinked, purchasetoken, purchaseNonce, site } = urlQueryArgs;
	const canDoSiteOnlyCheckout = unlinked && !! site && !! ( purchasetoken || purchaseNonce );
	useEffect( () => {
		if ( canDoSiteOnlyCheckout ) {
			dispatch(
				recordTracksEvent( 'calypso_jetpack_siteonly_pricing_page_visit', {
					site: siteSlug,
					path: viewTrackerPath,
					root_path: rootUrl,
				} )
			);
		}
	}, [ canDoSiteOnlyCheckout, dispatch, rootUrl, siteSlug, viewTrackerPath ] );

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
		[]
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
				className={ classNames(
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

				<ProductStore
					createCheckoutURL={ createProductURL }
					duration={ currentDuration }
					enableUserLicensesDialog={ enableUserLicensesDialog }
					onClickPurchase={ selectProduct }
					urlQueryArgs={ urlQueryArgs }
					header={ header }
					planRecommendation={ planRecommendation }
				/>

				<QueryProductsList type="jetpack" />
				<QueryIntroOffers siteId={ siteId ?? 'none' } />
				{ siteId && <QuerySiteProducts siteId={ siteId } /> }
				{ siteId && <QuerySitePurchases siteId={ siteId } /> }
				{ siteId && <QuerySites siteId={ siteId } /> }
			</Main>
			{ footer }
		</>
	);
};

export default SelectorPage;
