import {
	PRODUCT_JETPACK_STATS_MONTHLY,
	PRODUCT_JETPACK_STATS_PWYW_YEARLY,
	PRODUCT_JETPACK_STATS_FREE,
} from '@automattic/calypso-products';
import { ProductsList } from '@automattic/data-stores';
import { useTranslate } from 'i18n-calypso';
import page from 'page';
import { useEffect, useMemo } from 'react';
import DocumentHead from 'calypso/components/data/document-head';
import QueryProductsList from 'calypso/components/data/query-products-list';
import JetpackColophon from 'calypso/components/jetpack-colophon';
import { LoadingEllipsis } from 'calypso/components/loading-ellipsis';
import Main from 'calypso/components/main';
import { useSelector } from 'calypso/state';
import { getProductBySlug } from 'calypso/state/products-list/selectors';
import { getSiteSlug, isRequestingSites } from 'calypso/state/sites/selectors';
import getSiteProducts, { SiteProduct } from 'calypso/state/sites/selectors/get-site-products';
import isJetpackSite from 'calypso/state/sites/selectors/is-jetpack-site';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import PageViewTracker from '../stats-page-view-tracker';
import StatsPurchaseWizard, {
	SCREEN_PURCHASE,
	SCREEN_TYPE_SELECTION,
	TYPE_COMMERCIAL,
	TYPE_PERSONAL,
} from './stats-purchase-wizard';

const isProductOwned = ( ownedProducts: SiteProduct[] | null, searchedProduct: string ) => {
	if ( ! ownedProducts ) {
		return false;
	}

	return ownedProducts
		.filter( ( product ) => ! product.expired )
		.map( ( product ) => product.productSlug )
		.includes( searchedProduct );
};

const StatsPurchasePage = ( { query }: { query: { redirect_uri: string; from: string } } ) => {
	const translate = useTranslate();

	const siteId = useSelector( ( state ) => getSelectedSiteId( state ) );
	const siteSlug = useSelector( ( state ) => getSiteSlug( state, siteId ) );
	const isSiteJetpackNotAtomic = useSelector( ( state ) =>
		isJetpackSite( state, siteId, { treatAtomicAsJetpackSite: false } )
	);

	const siteProducts = useSelector( ( state ) => getSiteProducts( state, siteId ) );
	const isRequestingSiteProducts = useSelector( isRequestingSites );

	// Determine whether a product is owned.
	// TODO we need to do plan check as well, because Stats products would be built into other plans.
	const isFreeOwned = useMemo( () => {
		return isProductOwned( siteProducts, PRODUCT_JETPACK_STATS_FREE );
	}, [ siteProducts ] );
	const isCommercialOwned = useMemo( () => {
		return isProductOwned( siteProducts, PRODUCT_JETPACK_STATS_MONTHLY );
	}, [ siteProducts ] );
	const isPWYWOwned = useMemo( () => {
		return isProductOwned( siteProducts, PRODUCT_JETPACK_STATS_PWYW_YEARLY );
	}, [ siteProducts ] );

	useEffect( () => {
		if ( ! siteSlug ) {
			return;
		}
		const trafficPageUrl = `/stats/day/${ siteSlug }`;
		// Redirect to Calypso Stats if:
		// - the site is not Jetpack.
		// - the site already has a commercial stats plan.
		if ( ! isSiteJetpackNotAtomic || isCommercialOwned ) {
			page.redirect( trafficPageUrl );
		}
	}, [ siteSlug, isCommercialOwned, isSiteJetpackNotAtomic ] );

	const commercialProduct = useSelector( ( state ) =>
		getProductBySlug( state, PRODUCT_JETPACK_STATS_MONTHLY )
	) as ProductsList.ProductsListItem | null;

	const pwywProduct = useSelector( ( state ) =>
		getProductBySlug( state, PRODUCT_JETPACK_STATS_PWYW_YEARLY )
	) as ProductsList.ProductsListItem | null;

	const isLoading =
		! commercialProduct || ! pwywProduct || ( ! siteProducts && isRequestingSiteProducts );

	const [ initialStep, initialSiteType ] = useMemo( () => {
		if ( isPWYWOwned && ! isCommercialOwned ) {
			return [ SCREEN_PURCHASE, TYPE_COMMERCIAL ];
		}
		return [ SCREEN_TYPE_SELECTION, TYPE_PERSONAL ];
	}, [ isPWYWOwned, isCommercialOwned ] );

	return (
		<Main fullWidthLayout>
			<DocumentHead title={ translate( 'Jetpack Stats' ) } />
			<PageViewTracker
				path="/stats/purchase/:site"
				title="Stats > Purchase"
				from={ query.from ?? '' }
			/>
			<div className="stats">
				<QueryProductsList type="jetpack" />
				{
					// TODO: style loading state
				 }
				{ isLoading && (
					<div className="stats-purchase-page__loader">
						<LoadingEllipsis />
					</div>
				) }
				{ ! isLoading && (
					<>
						{ ( isFreeOwned || isCommercialOwned || isPWYWOwned ) && (
							<>
								{
									// TODO: add a banner handling information about existing purchase
								 }
							</>
						) }
						<StatsPurchaseWizard
							siteSlug={ siteSlug }
							commercialProduct={ commercialProduct }
							pwywProduct={ pwywProduct }
							siteId={ siteId }
							redirectUri={ query.redirect_uri ?? '' }
							from={ query.from ?? '' }
							disableFreeProduct={ isFreeOwned || isCommercialOwned || isPWYWOwned }
							initialStep={ initialStep }
							initialSiteType={ initialSiteType }
						/>
					</>
				) }
				<JetpackColophon />
			</div>
		</Main>
	);
};

export default StatsPurchasePage;
