import config from '@automattic/calypso-config';
import {
	PRODUCT_JETPACK_STATS_YEARLY,
	PRODUCT_JETPACK_STATS_MONTHLY,
	PRODUCT_JETPACK_STATS_PWYW_YEARLY,
} from '@automattic/calypso-products';
import page from '@automattic/calypso-router';
import { ProductsList } from '@automattic/data-stores';
import classNames from 'classnames';
import { useTranslate } from 'i18n-calypso';
import { useEffect, useMemo } from 'react';
import DocumentHead from 'calypso/components/data/document-head';
import QueryProductsList from 'calypso/components/data/query-products-list';
import QuerySitePurchases from 'calypso/components/data/query-site-purchases';
import JetpackColophon from 'calypso/components/jetpack-colophon';
import { LoadingEllipsis } from 'calypso/components/loading-ellipsis';
import Main from 'calypso/components/main';
import { useSelector } from 'calypso/state';
import { getProductBySlug } from 'calypso/state/products-list/selectors';
import getIsSiteWPCOM from 'calypso/state/selectors/is-site-wpcom';
import { getSiteSlug, getSiteOption } from 'calypso/state/sites/selectors';
import isJetpackSite from 'calypso/state/sites/selectors/is-jetpack-site';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import useStatsPurchases from '../hooks/use-stats-purchases';
import PageViewTracker from '../stats-page-view-tracker';
import { StatsPurchaseNoticePage, StatsPurchaseNotice } from './stats-purchase-notice';
import {
	StatsSingleItemPagePurchase,
	StatsSingleItemPersonalPurchasePage,
} from './stats-purchase-single-item';
import StatsPurchaseWizard, {
	SCREEN_PURCHASE,
	SCREEN_TYPE_SELECTION,
	TYPE_COMMERCIAL,
	TYPE_PERSONAL,
} from './stats-purchase-wizard';

const StatsPurchasePage = ( {
	query,
}: {
	query: { redirect_uri: string; from: string; productType: 'commercial' | 'personal' };
} ) => {
	const translate = useTranslate();
	const isTypeDetectionEnabled = config.isEnabled( 'stats/type-detection' );
	const isTierUpgradeSliderEnabled = config.isEnabled( 'stats/tier-upgrade-slider' );

	const siteId = useSelector( ( state ) => getSelectedSiteId( state ) );
	const siteSlug = useSelector( ( state ) => getSiteSlug( state, siteId ) );
	const isSiteJetpackNotAtomic = useSelector( ( state ) =>
		isJetpackSite( state, siteId, { treatAtomicAsJetpackSite: false } )
	);
	const isWPCOMSite = useSelector( ( state ) => siteId && getIsSiteWPCOM( state, siteId ) );

	const isCommercial = useSelector( ( state ) =>
		getSiteOption( state, siteId, 'is_commercial' )
	) as boolean;

	const {
		isRequestingSitePurchases,
		isFreeOwned,
		isPWYWOwned,
		isCommercialOwned,
		supportCommercialUse,
	} = useStatsPurchases( siteId );

	useEffect( () => {
		if ( ! siteSlug ) {
			return;
		}
		const trafficPageUrl = `/stats/day/${ siteSlug }`;
		// Redirect to Calypso Stats if:
		// - the site is not Jetpack.
		// TODO: remove this check once we have Stats in Calypso for all sites.
		if ( ! isSiteJetpackNotAtomic && ! config.isEnabled( 'stats/paid-wpcom-stats' ) ) {
			page.redirect( trafficPageUrl );
		}
	}, [ siteSlug, isSiteJetpackNotAtomic ] );

	const commercialProduct = useSelector( ( state ) =>
		getProductBySlug( state, PRODUCT_JETPACK_STATS_YEARLY )
	) as ProductsList.ProductsListItem | null;

	const commercialMonthlyProduct = useSelector( ( state ) =>
		getProductBySlug( state, PRODUCT_JETPACK_STATS_MONTHLY )
	) as ProductsList.ProductsListItem | null;

	const pwywProduct = useSelector( ( state ) =>
		getProductBySlug( state, PRODUCT_JETPACK_STATS_PWYW_YEARLY )
	) as ProductsList.ProductsListItem | null;

	const isLoading =
		! commercialProduct || ! commercialMonthlyProduct || ! pwywProduct || isRequestingSitePurchases;

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
	const allowCommercialTierUpgrade = isTierUpgradeSliderEnabled && isCommercialOwned;
	// We show purchase page if there is no plan owned or if we are forcing a product redirect
	const showPurchasePage = noPlanOwned || isForceProductRedirect || allowCommercialTierUpgrade;

	return (
		<Main fullWidthLayout>
			<DocumentHead title={ translate( 'Jetpack Stats' ) } />
			<PageViewTracker
				path="/stats/purchase/:site"
				title="Stats > Purchase"
				from={ query.from ?? '' }
			/>
			<div
				className={ classNames( 'stats', 'stats-purchase-page', {
					'stats-purchase-page--is-wpcom': isTypeDetectionEnabled && isWPCOMSite,
				} ) }
			>
				{ /* Only query site purchases on Calypso via existing data component */ }
				<QuerySitePurchases siteId={ siteId } />
				<QueryProductsList type="jetpack" />
				{ isLoading && (
					<div className="stats-purchase-page__loader">
						<LoadingEllipsis />
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
								// blog doesn't have any plan but is not categorised as either personal or commectial - show old purchase wizard
								! isForceProductRedirect && isCommercial === null && (
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
								)
							}
							{
								// blog is commercial or we are forcing a product - show the commercial purchase page
								( ( ! isForceProductRedirect && isCommercial ) || redirectToCommercial ) && (
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
								( ( ! isForceProductRedirect && isCommercial === false ) ||
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
