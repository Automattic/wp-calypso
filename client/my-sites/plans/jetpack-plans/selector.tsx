/**
 * External dependencies
 */
import React, { useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

/**
 * Internal dependencies
 */
import { useExperiment } from 'calypso/lib/explat';
import { recordTracksEvent } from 'calypso/state/analytics/actions/record';
import { EXTERNAL_PRODUCTS_LIST } from 'calypso/my-sites/plans/jetpack-plans/constants';
import {
	checkout,
	getYearlySlugFromMonthly,
	manageSitePurchase,
} from 'calypso/my-sites/plans/jetpack-plans/utils';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import { TERM_ANNUALLY } from '@automattic/calypso-products';
import { getSelectedSiteId, getSelectedSiteSlug } from 'calypso/state/ui/selectors';
import Main from 'calypso/components/main';
import QueryProductsList from 'calypso/components/data/query-products-list';
import QuerySites from 'calypso/components/data/query-sites';
import QuerySiteProducts from 'calypso/components/data/query-site-products';
import QuerySitePurchases from 'calypso/components/data/query-site-purchases';
import getViewTrackerPath from './get-view-tracker-path';
import ProductGrid from './product-grid';

/**
 * Type dependencies
 */
import type {
	Duration,
	ScrollCardIntoViewCallback,
	SelectorPageProps,
	SelectorProduct,
	PurchaseCallback,
} from 'calypso/my-sites/plans/jetpack-plans/types';

import './style.scss';

import debugFactory from 'debug';
const debug = debugFactory( 'calypso:plans:abtesting' );

const SelectorPage: React.FC< SelectorPageProps > = ( {
	defaultDuration = TERM_ANNUALLY,
	siteSlug: siteSlugProp,
	rootUrl,
	urlQueryArgs,
	header,
	footer,
	planRecommendation,
	highlightedProducts = [],
}: SelectorPageProps ) => {
	const dispatch = useDispatch();

	const [ loadingExperiment, experiment ] = useExperiment( 'jetpack_explat_testing_20210510' );
	useEffect( () => {
		if ( loadingExperiment ) {
			debug( 'Loading experiment ...' );
			return;
		}

		if ( ! experiment ) {
			debug( 'ERROR CONDITION: Experiment not loading, but no information found.' );
			return;
		}

		debug( 'Experiment loaded!' );
		debug( 'Experiment name:', experiment.experimentName );
		debug( 'Assigned variation:', experiment.variationName );
	}, [ loadingExperiment, experiment ] );

	const siteId = useSelector( ( state ) => getSelectedSiteId( state ) );
	const siteSlugState = useSelector( ( state ) => getSelectedSiteSlug( state ) ) || '';
	const siteSlug = siteSlugProp || siteSlugState;
	const [ currentDuration, setDuration ] = useState< Duration >( defaultDuration );
	const viewTrackerPath = getViewTrackerPath( rootUrl, siteSlugProp );
	const viewTrackerProps = siteId ? { site: siteSlug } : {};

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
			window.location.href = product.externalUrl || '';
			return;
		}

		if ( purchase && isUpgradeableToYearly ) {
			// Name of `calypso_product_checkout_click` is misleading, since it's only triggered
			// for Jetpack products. Leaving it here to not break current analysis, but please
			// use `calypso_jetpack_pricing_page_product_click` instead when using tracking tools.
			dispatch( recordTracksEvent( 'calypso_product_checkout_click', trackingProps ) );
			dispatch( recordTracksEvent( 'calypso_jetpack_pricing_page_product_click', trackingProps ) );

			const { productSlug: slug } = product;
			const yearlySlug = getYearlySlugFromMonthly( slug );

			if ( yearlySlug ) {
				checkout( siteSlug, yearlySlug, urlQueryArgs );
			}
			return;
		}

		if ( purchase ) {
			dispatch( recordTracksEvent( 'calypso_product_manage_click', trackingProps ) );
			manageSitePurchase( siteSlug, purchase.id );
			return;
		}

		// Name of `calypso_product_checkout_click` is misleading, since it's only triggered
		// for Jetpack products. Leaving it here to not break current analysis, but please
		// use `calypso_jetpack_pricing_page_product_click` instead when using tracking tools.
		dispatch( recordTracksEvent( 'calypso_product_checkout_click', trackingProps ) );
		dispatch( recordTracksEvent( 'calypso_jetpack_pricing_page_product_click', trackingProps ) );
		checkout( siteSlug, product.productSlug, urlQueryArgs );
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

	return (
		<Main className="selector__main" wideLayout>
			<PageViewTracker path={ viewTrackerPath } properties={ viewTrackerProps } title="Plans" />

			{ header }

			<ProductGrid
				duration={ currentDuration }
				urlQueryArgs={ urlQueryArgs }
				planRecommendation={ planRecommendation }
				onSelectProduct={ selectProduct }
				onDurationChange={ trackDurationChange }
				scrollCardIntoView={ scrollCardIntoView }
			/>

			{ siteId ? <QuerySiteProducts siteId={ siteId } /> : <QueryProductsList type="jetpack" /> }
			{ siteId && <QuerySitePurchases siteId={ siteId } /> }
			{ siteId && <QuerySites siteId={ siteId } /> }

			{ footer }
		</Main>
	);
};

export default SelectorPage;
