import { Button } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { useMemo } from 'react';
import QueryJetpackPartnerPortalPartner from 'calypso/components/data/query-jetpack-partner-portal-partner';
import QueryProductsList from 'calypso/components/data/query-products-list';
import { jetpackProductsToShow } from 'calypso/jetpack-cloud/sections/overview/primary/overview-products/jetpack-products';
import ProductGrid from 'calypso/jetpack-cloud/sections/overview/primary/product-grid';
import getProductShortTitle from 'calypso/jetpack-cloud/sections/partner-portal/lib/get-product-short-title';
import { useDispatch, useSelector } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import useProductsQuery from 'calypso/state/partner-portal/licenses/hooks/use-products-query';
import { getProductsList, isProductsListFetching } from 'calypso/state/products-list/selectors';

import './style.scss';

export default function OverviewProducts() {
	const translate = useTranslate();
	const dispatch = useDispatch();

	const userProducts = useSelector( getProductsList );
	const isFetchingUserProducts = useSelector( isProductsListFetching );
	const { data: agencyProducts, isLoading: isLoadingProducts } = useProductsQuery();

	// Track the View All click
	const onViewAllClick = () => {
		dispatch( recordTracksEvent( 'calypso_jetpack_manage_overview_products_view_all_click' ) );
	};

	// Prepare the products to show in the grid
	const products = useMemo( () => {
		agencyProducts?.forEach( ( product ) => {
			const productData = jetpackProductsToShow[ product.slug ];

			if ( productData ) {
				productData.data = product;
				productData.name = getProductShortTitle( product, true );

				// We need the underscore version of the product slug to be able to get the product icon
				const userProduct = Object.values( userProducts ).find(
					( p ) => p.product_id === productData.data?.product_id
				);

				if ( userProduct ) {
					productData.slug = userProduct.product_slug;
				}
			}
		} );

		return Object.values( jetpackProductsToShow );
	}, [ agencyProducts, userProducts ] );

	return (
		<div className="overview-products">
			<QueryJetpackPartnerPortalPartner />
			<QueryProductsList type="jetpack" currency="USD" />
			<div className="overview-products__header">
				<div>
					<h2 className="overview-products__title">{ translate( 'Jetpack Products' ) }</h2>
					<div className="overview-products__description">
						{ translate( 'Purchase single products or save big when you buy in bulk.' ) }
					</div>
				</div>
				<Button
					href="/partner-portal/issue-license"
					className="overview-products__cta"
					primary
					onClick={ onViewAllClick }
				>
					{ translate( 'View All' ) }
				</Button>
			</div>
			<div className="overview-products__grid">
				{ isLoadingProducts || isFetchingUserProducts || userProducts === undefined ? (
					<div className="overview-products__is-loading"></div>
				) : (
					<ProductGrid products={ products } />
				) }
			</div>
		</div>
	);
}
