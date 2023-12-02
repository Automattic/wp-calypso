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
import { StatsPurchaseNotice } from './stats-purchase-notice';
import StatsPurchaseWizard, {
	SCREEN_PURCHASE,
	SCREEN_TYPE_SELECTION,
	TYPE_COMMERCIAL,
} from './stats-purchase-wizard';

const StatsPurchasePage = ( {
	query,
}: {
	query: { redirect_uri: string; from: string; productType: 'commercial' | 'personal' };
} ) => {
	const translate = useTranslate();

	const siteId = useSelector( ( state ) => getSelectedSiteId( state ) );
	const siteSlug = useSelector( ( state ) => getSiteSlug( state, siteId ) );
	const isSiteJetpackNotAtomic = useSelector( ( state ) =>
		isJetpackSite( state, siteId, { treatAtomicAsJetpackSite: false } )
	);
	const isWPCOMSite = useSelector( ( state ) => siteId && getIsSiteWPCOM( state, siteId ) );

	const { isRequestingSitePurchases, isFreeOwned, isPWYWOwned, supportCommercialUse } =
		useStatsPurchases( siteId );

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
		if ( isPWYWOwned && ! supportCommercialUse ) {
			return [ SCREEN_PURCHASE, TYPE_COMMERCIAL ];
		}
		// if nothing is owned don't specify the type
		return [ SCREEN_TYPE_SELECTION, null ];
	}, [ isPWYWOwned, supportCommercialUse ] );

	const maxSliderPrice = commercialMonthlyProduct?.cost;

	const noPlanOwned = ! supportCommercialUse && ! isFreeOwned && ! isPWYWOwned;

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
					'stats-purchase-page--is-wpcom': isWPCOMSite,
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
					// Show the purchase wizard
					! isLoading && (
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
				<JetpackColophon />
			</div>
		</Main>
	);
};

export default StatsPurchasePage;
