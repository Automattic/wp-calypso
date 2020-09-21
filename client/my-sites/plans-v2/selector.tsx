/**
 * External dependencies
 */
import page from 'page';
import React, { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';

/**
 * Internal dependencies
 */
import { recordTracksEvent } from 'state/analytics/actions/record';
import PlansFilterBar from './plans-filter-bar';
import PlansColumn from './plans-column';
import ProductsColumn from './products-column';
import { SECURITY } from './constants';
import { getPathToDetails, getPathToUpsell, checkout } from './utils';
import QueryProducts from './query-products';
import useHasProductUpsell from './use-has-product-upsell';
import isJetpackCloud from 'lib/jetpack/is-jetpack-cloud';
import { getYearlyPlanByMonthly } from 'lib/plans';
import { TERM_ANNUALLY } from 'lib/plans/constants';
import { getSelectedSiteId, getSelectedSiteSlug } from 'state/ui/selectors';
import { managePurchase } from 'me/purchases/paths';
import Main from 'components/main';
import QuerySitePurchases from 'components/data/query-site-purchases';
import QuerySites from 'components/data/query-sites';
import QueryProductsList from 'components/data/query-products-list';
import JetpackFreeCard from 'components/jetpack/card/jetpack-free-card';

/**
 * Type dependencies
 */
import type {
	Duration,
	ProductType,
	SelectorPageProps,
	SelectorProduct,
	PurchaseCallback,
} from './types';
import type { ProductSlug } from 'lib/products-values/types';

import './style.scss';

const SelectorPage = ( {
	defaultDuration = TERM_ANNUALLY,
	rootUrl,
	header,
	footer,
}: SelectorPageProps ) => {
	const dispatch = useDispatch();

	const siteId = useSelector( ( state ) => getSelectedSiteId( state ) );
	const siteSlug = useSelector( ( state ) => getSelectedSiteSlug( state ) ) || '';
	const hasUpsell = useHasProductUpsell();
	const [ productType, setProductType ] = useState< ProductType >( SECURITY );
	const [ currentDuration, setDuration ] = useState< Duration >( defaultDuration );

	useEffect( () => {
		setDuration( defaultDuration );
	}, [ defaultDuration ] );

	// Sends a user to a page based on whether there are subtypes.
	const selectProduct: PurchaseCallback = (
		product: SelectorProduct,
		isUpgradeableToYearly = false,
		purchase
	) => {
		if ( purchase && isUpgradeableToYearly ) {
			checkout( siteSlug, getYearlyPlanByMonthly( product.productSlug ) );
			return;
		}

		if ( purchase ) {
			page( managePurchase( siteSlug, purchase.id ) );
			return;
		}

		if ( product.subtypes.length ) {
			dispatch(
				recordTracksEvent( 'calypso_product_subtypes_view', {
					site_id: siteId || undefined,
					product_slug: product.productSlug,
					duration: currentDuration,
				} )
			);
			page( getPathToDetails( rootUrl, product.productSlug, currentDuration, siteSlug ) );
			return;
		}

		if ( hasUpsell( product.productSlug as ProductSlug ) ) {
			page( getPathToUpsell( rootUrl, product.productSlug, currentDuration, siteSlug ) );
			return;
		}

		checkout( siteSlug, product.productSlug );
	};

	const trackProductTypeChange = ( selectedType: ProductType ) => {
		if ( selectedType === productType ) {
			return;
		}

		dispatch(
			recordTracksEvent( 'calypso_plans_type_change', {
				site_id: siteId || undefined,
				product_type: selectedType,
			} )
		);
		setProductType( selectedType );
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

	const isInConnectFlow = useMemo(
		() =>
			/jetpack\/connect\/plans/.test( window.location.href ) ||
			/source=jetpack-connect-plans/.test( window.location.href ),
		[]
	);

	const showJetpackFreeCard = isInConnectFlow || isJetpackCloud();

	return (
		<Main className="selector__main" wideLayout>
			{ header }
			<PlansFilterBar
				showDurations
				showProductTypes
				onProductTypeChange={ trackProductTypeChange }
				productType={ productType }
				onDurationChange={ trackDurationChange }
				duration={ currentDuration }
			/>
			<div className="plans-v2__columns">
				<PlansColumn
					duration={ currentDuration }
					onPlanClick={ selectProduct }
					productType={ productType }
					siteId={ siteId }
				/>
				<ProductsColumn
					duration={ currentDuration }
					onProductClick={ selectProduct }
					productType={ productType }
					siteId={ siteId }
				/>
			</div>

			{ showJetpackFreeCard && (
				<>
					<div className="selector__divider" />
					<JetpackFreeCard />
				</>
			) }

			<QueryProductsList />
			<QueryProducts />
			{ siteId && <QuerySitePurchases siteId={ siteId } /> }
			{ siteId && <QuerySites siteId={ siteId } /> }
			{ footer }
		</Main>
	);
};

export default SelectorPage;
