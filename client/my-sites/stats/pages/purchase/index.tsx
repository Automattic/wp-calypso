import {
	PRODUCT_JETPACK_STATS_YEARLY,
	PRODUCT_JETPACK_STATS_MONTHLY,
	PRODUCT_JETPACK_STATS_PWYW_YEARLY,
} from '@automattic/calypso-products';
import page from '@automattic/calypso-router';
import { ProductsList } from '@automattic/data-stores';
import clsx from 'clsx';
import { translate } from 'i18n-calypso';
import { useEffect, useRef } from 'react';
import StatsNavigation from 'calypso/blocks/stats-navigation';
import DocumentHead from 'calypso/components/data/document-head';
import QueryProductsList from 'calypso/components/data/query-products-list';
import QuerySitePurchases from 'calypso/components/data/query-site-purchases';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import Main from 'calypso/my-sites/stats/components/stats-main';
import { STATS_PRODUCT_NAME } from 'calypso/my-sites/stats/constants';
import { useSelector } from 'calypso/state';
import { getProductBySlug } from 'calypso/state/products-list/selectors';
import getIsSiteWPCOM from 'calypso/state/selectors/is-site-wpcom';
import isVipSite from 'calypso/state/selectors/is-vip-site';
import { getSiteSlug, getSiteOption } from 'calypso/state/sites/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import useStatsPurchases from '../../hooks/use-stats-purchases';
import PageViewTracker from '../../stats-page-view-tracker';
import {
	StatsSingleItemPagePurchase,
	StatsSingleItemPersonalPurchasePage,
} from '../../stats-purchase/stats-purchase-single-item';
import PageLoading from '../shared/page-loading';
import './style.scss';

const StatsPurchasePage = ( {
	query,
}: {
	query: { redirect_uri: string; from: string; productType: 'commercial' | 'personal' };
} ) => {
	const siteId = useSelector( getSelectedSiteId );
	const siteSlug = useSelector( ( state ) => getSiteSlug( state, siteId ) );
	const isWPCOMSite = useSelector( ( state ) => siteId && getIsSiteWPCOM( state, siteId ) );
	// `is_vip` option is not set in Odyssey, so we need to check `options.is_vip` as well.
	const isVip = useSelector(
		( state ) =>
			!! isVipSite( state as object, siteId as number ) ||
			!! getSiteOption( state, siteId, 'is_vip' )
	);

	const isCommercial = useSelector( ( state ) =>
		getSiteOption( state, siteId, 'is_commercial' )
	) as boolean;

	const {
		isRequestingSitePurchases,
		isFreeOwned,
		isPWYWOwned,
		supportCommercialUse,
		hasLoadedSitePurchases,
		hasAnyPlan,
	} = useStatsPurchases( siteId );

	useEffect( () => {
		if ( ! siteSlug ) {
			return;
		}
		if ( isVip ) {
			page.redirect( `/stats/day/${ siteSlug }` ); // Redirect to the stats page for VIP sites
		}
	}, [ siteSlug, isVip ] );

	const hasTrackedUpgradeSource = useRef( false );

	useEffect( () => {
		// Scroll to top on page load
		window.scrollTo( 0, 0 );
		// track different upgrade sources
		let triggeredEvent;

		switch ( query?.from ) {
			case 'calypso-stats-tier-upgrade-notice':
				triggeredEvent = 'calypso_stats_tier_upgrade_notice_upgrade_button_clicked';
				break;
			case 'jetpack-stats-tier-upgrade-notice':
				triggeredEvent = 'jetpack_odyssey_stats_tier_upgrade_notice_upgrade_button_clicked';
				break;
			case 'jetpack-stats-tier-upgrade-usage-section':
				triggeredEvent = 'jetpack_odyssey_stats_tier_usage_bar_upgrade_button_clicked';
				break;
			case 'calypso-stats-tier-upgrade-usage-section':
				triggeredEvent = 'calypso_stats_tier_usage_bar_upgrade_button_clicked';
				break;
		}

		// Wait for the selected site to resolve so the event carries a real
		// blog_id, and fire at most once per page load.
		if ( triggeredEvent && siteId && ! hasTrackedUpgradeSource.current ) {
			hasTrackedUpgradeSource.current = true;
			recordTracksEvent( triggeredEvent, { blog_id: siteId } );
		}
	}, [ siteSlug, query, query?.from, siteId ] );

	const commercialProduct = useSelector( ( state ) =>
		getProductBySlug( state, PRODUCT_JETPACK_STATS_YEARLY )
	) as ProductsList.RawAPIProduct | null;

	const commercialMonthlyProduct = useSelector( ( state ) =>
		getProductBySlug( state, PRODUCT_JETPACK_STATS_MONTHLY )
	) as ProductsList.RawAPIProduct | null;

	const pwywProduct = useSelector( ( state ) =>
		getProductBySlug( state, PRODUCT_JETPACK_STATS_PWYW_YEARLY )
	) as ProductsList.RawAPIProduct | null;

	const isLoading =
		! commercialProduct ||
		! commercialMonthlyProduct ||
		! pwywProduct ||
		isRequestingSitePurchases ||
		( siteId && ! hasLoadedSitePurchases ); // only check `hasLoadedSitePurchases` if siteId is available

	const maxSliderPrice = commercialMonthlyProduct?.cost;

	const redirectToCommercial = query?.productType === 'commercial'; // allow multiple visit to upgrade commercial tier.
	// Redirect to personal is there is the query param is set, the site doesn't have personal license yet, and it's not redirecting to commercial
	const redirectToPersonal =
		query?.productType === 'personal' && ! isPWYWOwned && ! redirectToCommercial;
	const noPlanOwned = ! supportCommercialUse && ! isFreeOwned && ! isPWYWOwned;

	// The paid plan is the default upgrade landing regardless of commercial classification; the
	// PWYW page is only reachable when explicitly requested via `productType=personal`. Sites that
	// already own a plan land here too, so they can move up a tier.
	const variant = redirectToPersonal ? 'personal' : 'commercial';

	const showNavigation = ! isLoading && ! hasAnyPlan && query.from?.startsWith( 'cmp-red' );

	return (
		<Main
			fullWidthLayout
			pageSubTitle={
				showNavigation ? translate( 'Simple, powerful analytics to grow your site.' ) : undefined
			}
			pageTabs={
				showNavigation ? (
					<StatsNavigation
						selectedItem="traffic"
						interval="day"
						siteId={ siteId }
						slug={ siteSlug }
						showLock
					/>
				) : undefined
			}
		>
			<DocumentHead title={ STATS_PRODUCT_NAME } />
			{ ! isLoading && (
				<PageViewTracker
					path="/stats/purchase/:site"
					title="Stats > Purchase"
					from={ query.from ?? '' }
					variant={ variant }
					is_upgrade={ +supportCommercialUse }
					is_site_commercial={ isCommercial === null ? '' : +isCommercial }
				/>
			) }
			<div
				className={ clsx( 'stats', 'stats-purchase-page', {
					'stats-purchase-page--is-wpcom': isWPCOMSite,
				} ) }
			>
				{ /* Only query site purchases on Calypso via existing data component */ }
				<QuerySitePurchases siteId={ siteId } />
				<QueryProductsList type="jetpack" />
				{ isLoading && <div className="stats-purchase-page__loader">{ PageLoading }</div> }
				{ ! isLoading && (
					<>
						{
							// the default upgrade landing - show the paid plan purchase page
							variant === 'commercial' && (
								<div className="stats-purchase-page__notice">
									<StatsSingleItemPagePurchase
										siteSlug={ siteSlug ?? '' }
										planValue={ commercialProduct?.cost }
										currencyCode={ commercialProduct?.currency_code }
										siteId={ siteId }
										redirectUri={ query.redirect_uri ?? '' }
										from={ query.from ?? '' }
										isCommercial={ isCommercial }
									/>
								</div>
							)
						}
						{
							// the personal product was explicitly requested - show the PWYW purchase page
							variant === 'personal' && (
								<StatsSingleItemPersonalPurchasePage
									siteSlug={ siteSlug || '' }
									maxSliderPrice={ maxSliderPrice ?? 10 }
									pwywProduct={ pwywProduct }
									siteId={ siteId }
									redirectUri={ query.redirect_uri ?? '' }
									from={ query.from ?? '' }
									disableFreeProduct={ ! noPlanOwned }
								/>
							)
						}
					</>
				) }
			</div>
		</Main>
	);
};

export default StatsPurchasePage;
