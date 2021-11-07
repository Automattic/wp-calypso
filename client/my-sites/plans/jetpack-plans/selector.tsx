import { TERM_ANNUALLY } from '@automattic/calypso-products';
import classNames from 'classnames';
import { useCallback, useEffect, useState } from 'react';
import * as React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import QueryJetpackSaleCoupon from 'calypso/components/data/query-jetpack-sale-coupon';
import QueryProductsList from 'calypso/components/data/query-products-list';
import QuerySiteProducts from 'calypso/components/data/query-site-products';
import QuerySitePurchases from 'calypso/components/data/query-site-purchases';
import QuerySites from 'calypso/components/data/query-sites';
import Main from 'calypso/components/main';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import isJetpackCloud from 'calypso/lib/jetpack/is-jetpack-cloud';
import { EXTERNAL_PRODUCTS_LIST } from 'calypso/my-sites/plans/jetpack-plans/constants';
import { recordTracksEvent } from 'calypso/state/analytics/actions/record';
import { getSelectedSiteId, getSelectedSiteSlug } from 'calypso/state/ui/selectors';
import { getPurchaseURLCallback } from './get-purchase-url-callback';
import getViewTrackerPath from './get-view-tracker-path';
import { getForCurrentCROIteration, Iterations } from './iterations';
import ProductGrid from './product-grid';
import type {
	Duration,
	ScrollCardIntoViewCallback,
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
	planRecommendation,
	highlightedProducts = [],
}: SelectorPageProps ) => {
	const dispatch = useDispatch();

	const siteId = useSelector( ( state ) => getSelectedSiteId( state ) );
	const siteSlugState = useSelector( ( state ) => getSelectedSiteSlug( state ) ) || '';
	const siteSlug = siteSlugProp || siteSlugState;
	const [ currentDuration, setDuration ] = useState< Duration >( defaultDuration );
	const viewTrackerPath = getViewTrackerPath( rootUrl, siteSlugProp );
	const viewTrackerProps = siteId ? { site: siteSlug } : {};
	const legacyPlan = planRecommendation ? planRecommendation[ 0 ] : null;

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

	const scrollCardIntoView: ScrollCardIntoViewCallback = useCallback(
		( element, productSlug ) => {
			if ( highlightedProducts.includes( productSlug ) ) {
				// Timeout to make sure everything has rendered before
				// before scrolling the element into view.
				element.scrollIntoView( {
					behavior: 'smooth',
				} );
			}
		},
		[ highlightedProducts ]
	);

	const createProductURL = getPurchaseURLCallback( siteSlug, urlQueryArgs );

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

	const trackDurationChange = ( selectedDuration: Duration ) => {
		if ( selectedDuration === currentDuration ) {
			return;
		}

		dispatch(
			recordTracksEvent( 'calypso_plans_duration_change', {
				site_id: siteId || undefined,
				duration: selectedDuration,
			} )
		);
		setDuration( selectedDuration );
	};

	const iterationClassName = getForCurrentCROIteration(
		( variation: Iterations | null ) => `jetpack-plans__iteration--${ variation ?? 'default' }`
	);

	return (
		<>
			<QueryJetpackSaleCoupon />
			{ nav }

			<Main className={ classNames( 'selector__main', iterationClassName ) } wideLayout>
				<PageViewTracker
					path={ viewTrackerPath }
					properties={ viewTrackerProps }
					title="Plans"
					options={ { useJetpackGoogleAnalytics: ! isJetpackCloud() } }
				/>

				{ header }

				<ProductGrid
					duration={ currentDuration }
					urlQueryArgs={ urlQueryArgs }
					planRecommendation={ planRecommendation }
					onSelectProduct={ selectProduct }
					onDurationChange={ trackDurationChange }
					scrollCardIntoView={ scrollCardIntoView }
					createButtonURL={ createProductURL }
				/>

				<QueryProductsList type="jetpack" />
				{ siteId && <QuerySiteProducts siteId={ siteId } /> }
				{ siteId && <QuerySitePurchases siteId={ siteId } /> }
				{ siteId && <QuerySites siteId={ siteId } /> }

				{ footer }
			</Main>
		</>
	);
};

export default SelectorPage;
