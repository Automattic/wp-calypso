import config from '@automattic/calypso-config';
import {
	PRODUCT_JETPACK_STATS_YEARLY,
	PRODUCT_JETPACK_STATS_MONTHLY,
	PRODUCT_JETPACK_STATS_PWYW_YEARLY,
} from '@automattic/calypso-products';
import { ProductsList } from '@automattic/data-stores';
import classNames from 'classnames';
import { useTranslate } from 'i18n-calypso';
import page from 'page';
import { useEffect, useMemo } from 'react';
import DocumentHead from 'calypso/components/data/document-head';
import QueryProductsList from 'calypso/components/data/query-products-list';
import QuerySitePurchases from 'calypso/components/data/query-site-purchases';
import JetpackColophon from 'calypso/components/jetpack-colophon';
import { LoadingEllipsis } from 'calypso/components/loading-ellipsis';
import Main from 'calypso/components/main';
import { useSelector } from 'calypso/state';
import { getProductBySlug } from 'calypso/state/products-list/selectors';
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

	const siteId = useSelector( ( state ) => getSelectedSiteId( state ) );
	const siteSlug = useSelector( ( state ) => getSiteSlug( state, siteId ) );
	const isSiteJetpackNotAtomic = useSelector( ( state ) =>
		isJetpackSite( state, siteId, { treatAtomicAsJetpackSite: false } )
	);

	const isCommercial = useSelector( ( state ) => getSiteOption( state, siteId, 'is_commercial' ) );

	const { isRequestingSitePurchases, isFreeOwned, isPWYWOwned, supportCommercialUse } =
		useStatsPurchases( siteId );

	useEffect( () => {
		if ( ! siteSlug ) {
			return;
		}
		const trafficPageUrl = `/stats/day/${ siteSlug }`;
		// Redirect to Calypso Stats if:
		// - the site is not Jetpack.
		if ( ! isSiteJetpackNotAtomic ) {
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

	const showPurchasePage = ! supportCommercialUse && ! isFreeOwned && ! isPWYWOwned;
	const redirectToPersonal = query?.productType === 'personal';
	const redirectToCommercial = query?.productType === 'commercial';
	const isNoticeScreenRedirect = redirectToPersonal || redirectToCommercial;

	return (
		<Main fullWidthLayout>
			<DocumentHead title={ translate( 'Jetpack Stats' ) } />
			<PageViewTracker
				path="/stats/purchase/:site"
				title="Stats > Purchase"
				from={ query.from ?? '' }
			/>
			<div className={ classNames( 'stats', 'stats-purchase-page' ) }>
				{ /* Only query site purchases on Calypso via existing data component */ }
				<QuerySitePurchases siteId={ siteId } />
				<QueryProductsList type="jetpack" />
				{ isLoading && (
					<div className="stats-purchase-page__loader">
						<LoadingEllipsis />
					</div>
				) }
				{ ! isLoading && ! isTypeDetectionEnabled && (
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
								disableFreeProduct={ isFreeOwned || supportCommercialUse || isPWYWOwned }
								initialStep={ initialStep }
								initialSiteType={ initialSiteType }
							/>
						) }
					</>
				) }
				{ ! isLoading && isTypeDetectionEnabled && (
					<>
						{
							// a plan is owned - show a notice page
							! isNoticeScreenRedirect && ! showPurchasePage && (
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
							// blog doesn't have any plan but is not categorised as either personal or commectial - show old purchase wizard
							( redirectToPersonal || redirectToCommercial || showPurchasePage ) &&
								isCommercial === null && (
									<StatsPurchaseWizard
										siteSlug={ siteSlug }
										commercialProduct={ commercialProduct }
										maxSliderPrice={ maxSliderPrice ?? 10 }
										pwywProduct={ pwywProduct }
										siteId={ siteId }
										redirectUri={ query.redirect_uri ?? '' }
										from={ query.from ?? '' }
										disableFreeProduct={ isFreeOwned || supportCommercialUse || isPWYWOwned }
										initialStep={ initialStep }
										initialSiteType={ initialSiteType }
									/>
								)
						}
						{
							// blog has been already categorised as either personal or commercial and doesn't have a plan purchased
							( redirectToPersonal || redirectToCommercial || showPurchasePage ) && (
								<>
									{ ( redirectToCommercial ||
										( ! redirectToPersonal && ! supportCommercialUse && isCommercial ) ) && (
										<div className="stats-purchase-page__notice">
											<StatsSingleItemPagePurchase
												siteSlug={ siteSlug ?? '' }
												planValue={ commercialProduct?.cost }
												currencyCode={ commercialProduct?.currency_code }
												siteId={ siteId }
												redirectUri={ query.redirect_uri ?? '' }
												from={ query.from ?? '' }
											/>
										</div>
									) }
									{ ( redirectToPersonal ||
										( ! redirectToCommercial &&
											! supportCommercialUse &&
											isCommercial === false ) ) && (
										<StatsSingleItemPersonalPurchasePage
											siteSlug={ siteSlug || '' }
											maxSliderPrice={ maxSliderPrice ?? 10 }
											pwywProduct={ pwywProduct }
											siteId={ siteId }
											redirectUri={ query.redirect_uri ?? '' }
											from={ query.from ?? '' }
											disableFreeProduct={ isFreeOwned || supportCommercialUse || isPWYWOwned }
										/>
									) }
								</>
							)
						}
					</>
				) }
				<JetpackColophon />
			</div>
		</Main>
	);
};

export default StatsPurchasePage;
