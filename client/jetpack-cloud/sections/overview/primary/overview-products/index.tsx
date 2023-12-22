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
import { getProductsList } from 'calypso/state/products-list/selectors';

import './style.scss';

export default function OverviewProducts() {
	const translate = useTranslate();
	const dispatch = useDispatch();

	const userProducts = useSelector( ( state ) => getProductsList( state ) );
	const { data: agencyProducts, isLoading: isLoadingProducts } = useProductsQuery();

	// Track the View All click
	const onViewAllClick = () => {
		dispatch( recordTracksEvent( 'calypso_jetpack_manage_overview_products_view_all_click' ) );
	};

	// Prepare the products to show in the grid
	const getProductsToShow = () => {
		// Populate the ProductData fields we need for the product grid
		agencyProducts?.forEach( ( product ) => {
			const productData = jetpackProductsToShow[ product.slug ];

			if ( productData ) {
				productData.data = product;
				productData.name = getProductShortTitle( product, true );
			}
		} );

		return Object.values( jetpackProductsToShow );
	};

	const products = useMemo( () => getProductsToShow(), [ agencyProducts ] );

	const showPlaceholder = () => <div className="overview-products__is-loading"></div>;

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
					primary={ true }
					onClick={ onViewAllClick }
				>
					{ translate( 'View All' ) }
				</Button>
			</div>
			<div className="overview-products__grid">
				{ isLoadingProducts || userProducts === undefined ? (
					showPlaceholder()
				) : (
					<ProductGrid products={ products } userProducts={ Object.values( userProducts ) } />
				) }
			</div>
		</div>
	);
}
