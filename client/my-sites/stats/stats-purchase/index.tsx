import config from '@automattic/calypso-config';
import {
	PRODUCT_JETPACK_STATS_MONTHLY,
	PRODUCT_JETPACK_STATS_PWYW_YEARLY,
	PRODUCT_JETPACK_STATS_FREE,
} from '@automattic/calypso-products';
import { ProductsList } from '@automattic/data-stores';
import { useTranslate } from 'i18n-calypso';
import { useMemo } from 'react';
import DocumentHead from 'calypso/components/data/document-head';
import JetpackColophon from 'calypso/components/jetpack-colophon';
import { LoadingEllipsis } from 'calypso/components/loading-ellipsis';
import Main from 'calypso/components/main';
import { useSelector } from 'calypso/state';
import { getProductBySlug } from 'calypso/state/products-list/selectors';
import { getSiteSlug } from 'calypso/state/sites/selectors';
import getSiteProducts, { SiteProduct } from 'calypso/state/sites/selectors/get-site-products';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import PageViewTracker from '../stats-page-view-tracker';
import StatsPurchaseWizard from './stats-purchase-wizard';

const isProductOwned = ( ownedProducts: SiteProduct[] | null, searchedProduct: string ) => {
	if ( ! ownedProducts ) {
		return false;
	}

	return ownedProducts
		.filter( ( product ) => ! product.expired )
		.map( ( product ) => product.productSlug )
		.includes( searchedProduct );
};

const StatsPurchasePage = () => {
	const translate = useTranslate();

	const siteId = useSelector( ( state ) => getSelectedSiteId( state ) );
	const siteSlug = useSelector( ( state ) => getSiteSlug( state, siteId ) );
	const isPurchaseEnabled = config.isEnabled( 'stats/paid-stats' );

	if ( ! isPurchaseEnabled ) {
		page( '/stats', '/stats/day' );
	}

	const siteProducts = useSelector( ( state ) => getSiteProducts( state, siteId ) );

	// Determine whether a product is owned.
	const isFreeOwned = useMemo( () => {
		return isProductOwned( siteProducts, PRODUCT_JETPACK_STATS_FREE );
	}, [ siteProducts ] );
	const isCommercialOwned = useMemo( () => {
		return isProductOwned( siteProducts, PRODUCT_JETPACK_STATS_MONTHLY );
	}, [ siteProducts ] );
	const isPWYWOwned = useMemo( () => {
		return isProductOwned( siteProducts, PRODUCT_JETPACK_STATS_PWYW_YEARLY );
	}, [ siteProducts ] );

	const commercialProduct = useSelector( ( state ) =>
		getProductBySlug( state, PRODUCT_JETPACK_STATS_MONTHLY )
	) as ProductsList.ProductsListItem | null;

	const pwywProduct = useSelector( ( state ) =>
		getProductBySlug( state, PRODUCT_JETPACK_STATS_PWYW_YEARLY )
	) as ProductsList.ProductsListItem | null;

	// eslint-disable-next-line no-console
	console.log( 'product debug:', commercialProduct, pwywProduct );

	const isLoading = ! commercialProduct || ! pwywProduct;

	return (
		<Main fullWidthLayout>
			<DocumentHead title={ translate( 'Jetpack Stats' ) } />
			<PageViewTracker path="/stats/purchase/:site" title="Stats > Purchase" />
			<div className="stats">
				{
					// TODO: style loading state
				 }
				{ isLoading && <LoadingEllipsis /> }
				{ ! isLoading && (
					<>
						{ ( isFreeOwned || isCommercialOwned || isPWYWOwned ) && (
							<>
								{
									// TODO: add a banner handling information about existing purchase
								 }
							</>
						) }
						{ isPurchaseEnabled && (
							<StatsPurchaseWizard
								siteSlug={ siteSlug }
								commercialProduct={ commercialProduct }
								pwywProduct={ pwywProduct }
							/>
						) }
					</>
				) }
				<JetpackColophon />
			</div>
		</Main>
	);
};

export default StatsPurchasePage;
