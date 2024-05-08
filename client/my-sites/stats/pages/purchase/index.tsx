import config from '@automattic/calypso-config';
import {
	PRODUCT_JETPACK_STATS_YEARLY,
	PRODUCT_JETPACK_STATS_MONTHLY,
	PRODUCT_JETPACK_STATS_PWYW_YEARLY,
} from '@automattic/calypso-products';
import page from '@automattic/calypso-router';
import { ProductsList } from '@automattic/data-stores';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import { useEffect, useMemo } from 'react';
import StatsNavigation from 'calypso/blocks/stats-navigation';
import DocumentHead from 'calypso/components/data/document-head';
import QueryProductsList from 'calypso/components/data/query-products-list';
import QuerySitePurchases from 'calypso/components/data/query-site-purchases';
import InlineSupportLink from 'calypso/components/inline-support-link';
import JetpackColophon from 'calypso/components/jetpack-colophon';
import Main from 'calypso/components/main';
import NavigationHeader from 'calypso/components/navigation-header';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { useSelector } from 'calypso/state';
import { getProductBySlug } from 'calypso/state/products-list/selectors';
import getIsSiteWPCOM from 'calypso/state/selectors/is-site-wpcom';
import isVipSite from 'calypso/state/selectors/is-vip-site';
import { getSiteSlug, getSiteOption } from 'calypso/state/sites/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import useStatsPurchases from '../../hooks/use-stats-purchases';
import PageViewTracker from '../../stats-page-view-tracker';
import {
	StatsPurchaseNoticePage,
	StatsPurchaseNotice,
} from '../../stats-purchase/stats-purchase-notice';
import {
	StatsSingleItemPagePurchase,
	StatsSingleItemPersonalPurchasePage,
} from '../../stats-purchase/stats-purchase-single-item';
import StatsPurchaseWizard, {
	SCREEN_PURCHASE,
	SCREEN_TYPE_SELECTION,
	TYPE_COMMERCIAL,
	TYPE_PERSONAL,
} from '../../stats-purchase/stats-purchase-wizard';
import StatsLoader from '../../stats-redirect/stats-loader';
import './style.scss';

const StatsPurchasePage = ( {
	query,
}: {
	query: { redirect_uri: string; from: string; productType: 'commercial' | 'personal' };
} ) => {
	const translate = useTranslate();
	const isTypeDetectionEnabled = config.isEnabled( 'stats/type-detection' );
	const isTierUpgradeSliderEnabled = config.isEnabled( 'stats/tier-upgrade-slider' );

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
		isCommercialOwned,
		supportCommercialUse,
		isLegacyCommercialLicense,
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

		if ( triggeredEvent ) {
			recordTracksEvent( triggeredEvent );
		}
	}, [ siteSlug, query, query?.from ] );

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

	const [ initialStep, initialSiteType ] = useMemo( () => {
		// if the site is detected as commercial
		if ( isTypeDetectionEnabled ) {
			if ( isCommercial && ! supportCommercialUse ) {
				return [ SCREEN_PURCHASE, TYPE_COMMERCIAL ];
			}
			// If the site is detected as personal
			else if ( isCommercial === false && ! supportCommercialUse ) {
				return [ SCREEN_PURCHASE, TYPE_PERSONAL ];
			}
		}

		if ( isPWYWOwned && ! supportCommercialUse ) {
			return [ SCREEN_PURCHASE, TYPE_COMMERCIAL ];
		}
		// if nothing is owned don't specify the type
		return [ SCREEN_TYPE_SELECTION, null ];
	}, [ isPWYWOwned, supportCommercialUse, isCommercial, isTypeDetectionEnabled ] );

	const maxSliderPrice = commercialMonthlyProduct?.cost;

	// Redirect to commercial is there is the query param is set and the site doesn't have commercial license yet
	const redirectToCommercial = ! isTierUpgradeSliderEnabled
		? query?.productType === 'commercial' && ! supportCommercialUse
		: query?.productType === 'commercial'; // allow multiple visit to upgrade commercial tier.
	// Redirect to personal is there is the query param is set, the site doesn't have personal license yet, and it's not redirecting to commercial
	const redirectToPersonal =
		query?.productType === 'personal' && ! isPWYWOwned && ! redirectToCommercial;
	// Whether it's forced to redirect to a product
	const isForceProductRedirect = redirectToPersonal || redirectToCommercial;
	const noPlanOwned = ! supportCommercialUse && ! isFreeOwned && ! isPWYWOwned;
	const allowCommercialTierUpgrade =
		isTierUpgradeSliderEnabled && isCommercialOwned && ! isLegacyCommercialLicense;

	// We show purchase page if there is no plan owned or if we are forcing a product redirect
	// VIP sites are exempt from being shown this page.
	const showPurchasePage = noPlanOwned || isForceProductRedirect || allowCommercialTierUpgrade;

	const variant = useMemo( () => {
		let pageVariant = 'personal';
		if ( ! showPurchasePage ) {
			pageVariant = 'notice';
		} else if (
			( ! isForceProductRedirect &&
				( isCommercial || isCommercial === null || isCommercialOwned ) ) ||
			redirectToCommercial
		) {
			pageVariant = 'commercial';
		}
		return pageVariant;
	}, [
		showPurchasePage,
		isCommercial,
		isCommercialOwned,
		redirectToCommercial,
		isForceProductRedirect,
	] );

	return (
		<Main fullWidthLayout>
			<DocumentHead title={ translate( 'Jetpack Stats' ) } />
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
					'stats-purchase-page--is-wpcom': isTypeDetectionEnabled && isWPCOMSite,
				} ) }
			>
				{ /** Only show the navigation header on force redirections and site has no plans */ }
				{ ! isLoading && ! hasAnyPlan && query.from?.startsWith( 'cmp-red' ) && (
					<>
						<NavigationHeader
							className="stats__section-header modernized-header"
							title={ translate( 'Jetpack Stats' ) }
							subtitle={ translate(
								"Gain insights into the activity and behavior of your site's visitors. {{learnMoreLink}}Learn more{{/learnMoreLink}}",
								{
									components: {
										learnMoreLink: <InlineSupportLink supportContext="stats" showIcon={ false } />,
									},
								}
							) }
							navigationItems={ [] }
						></NavigationHeader>
						<StatsNavigation
							selectedItem="traffic"
							interval="day"
							siteId={ siteId }
							slug={ siteSlug }
							showLock={ true }
							hideModuleSettings
						/>
					</>
				) }

				{ /* Only query site purchases on Calypso via existing data component */ }
				<QuerySitePurchases siteId={ siteId } />
				<QueryProductsList type="jetpack" />
				{ isLoading && (
					<div className="stats-purchase-page__loader">
						<StatsLoader />
					</div>
				) }
				{
					// old flow - show the purchase wizard
					! isLoading && ! isTypeDetectionEnabled && (
						<>
							{ supportCommercialUse && (
								<div className="stats-purchase-page__notice">
									<StatsPurchaseNotice siteSlug={ siteSlug } />
								</div>
							) }
							{ ! supportCommercialUse && (
								<StatsPurchaseWizard
									siteSlug={ siteSlug }
									commercialProduct={ commercialProduct }
									maxSliderPrice={ maxSliderPrice ?? 10 }
									pwywProduct={ pwywProduct }
									siteId={ siteId }
									redirectUri={ query.redirect_uri ?? '' }
									from={ query.from ?? '' }
									disableFreeProduct={ ! noPlanOwned }
									initialStep={ initialStep }
									initialSiteType={ initialSiteType }
								/>
							) }
						</>
					)
				}
				{
					// a plan is owned or not forced to purchase - show a notice page
					! isLoading && isTypeDetectionEnabled && ! showPurchasePage && (
						<StatsPurchaseNoticePage
							siteId={ siteId }
							siteSlug={ siteSlug }
							isCommercialOwned={ supportCommercialUse }
							isFreeOwned={ isFreeOwned }
							isPWYWOwned={ isPWYWOwned }
						/>
					)
				}
				{
					// there is still plans to purchase - show the purchase page
					! isLoading && isTypeDetectionEnabled && showPurchasePage && (
						<>
							{
								// blog is commercial, we are forcing a product or the site is not identified yet - show the commercial purchase page
								// TODO: remove StatsPurchaseWizard component as it's not in use anymore.
								( ( ! isForceProductRedirect &&
									( isCommercial || isCommercial === null || isCommercialOwned ) ) ||
									redirectToCommercial ) && (
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
								// blog is personal or we are forcing a product - show the personal purchase page
								// If user has already got a commercial license, we should not show the PWYW plan.
								( ( ! isForceProductRedirect && isCommercial === false && ! isCommercialOwned ) ||
									redirectToPersonal ) && (
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
					)
				}
				<JetpackColophon />
			</div>
		</Main>
	);
};

export default StatsPurchasePage;
