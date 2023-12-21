import { TERM_MONTHLY } from '@automattic/calypso-products';
import { Button } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { useMemo } from 'react';
import QueryJetpackPartnerPortalPartner from 'calypso/components/data/query-jetpack-partner-portal-partner';
import QueryProductsList from 'calypso/components/data/query-products-list';
import Paid from 'calypso/components/jetpack/card/jetpack-product-card/display-price/paid';
import { jetpackProductsToShow } from 'calypso/jetpack-cloud/sections/overview/primary/overview-products/jetpack-products';
import getProductShortTitle from 'calypso/jetpack-cloud/sections/partner-portal/lib/get-product-short-title';
import { MoreInfoLink } from 'calypso/my-sites/plans/jetpack-plans/product-store/more-info-link';
import { SimpleItemCard } from 'calypso/my-sites/plans/jetpack-plans/product-store/simple-item-card';
import getProductIcon from 'calypso/my-sites/plans/jetpack-plans/product-store/utils/get-product-icon';
import { SelectorProduct } from 'calypso/my-sites/plans/jetpack-plans/types';
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

	const processProducts = () => {
		agencyProducts?.forEach( ( product ) => {
			const productData = jetpackProductsToShow[ product.slug ];

			if ( productData ) {
				productData.data = product;
				productData.name = getProductShortTitle( product, true );
			}
		} );

		return Object.values( jetpackProductsToShow );
	};

	const products = useMemo( () => processProducts(), [ agencyProducts ] );

	const onMoreAboutClick = ( product_slug: string ) => {
		dispatch(
			recordTracksEvent( 'calypso_jetpack_manage_overview_products_more_about_click', {
				product: product_slug,
			} )
		);
	};

	const onViewAllClick = () => {
		dispatch( recordTracksEvent( 'calypso_jetpack_manage_overview_products_view_all_click' ) );
	};

	const renderProducts = () => {
		if ( ! userProducts ) {
			return null;
		}

		return products.map( ( productData ) => {
			// We have to get the underscore version of the product slug
			const userProduct = Object.values( userProducts ).find(
				( p ) => p.product_id === productData.data.product_id
			);

			const icon = (
				<img
					alt={ productData.name + ' icon' }
					src={ getProductIcon( { productSlug: userProduct ? userProduct.product_slug : '' } ) }
				/>
			);

			const itemData: SelectorProduct = {
				moreAboutUrl: productData.url,
				shortName: <>{ productData.name }</>,
				productSlug: userProduct ? userProduct.product_slug : '',
			};

			const description = (
				<>
					{ productData.description } <br />
					<MoreInfoLink
						onClick={ () => onMoreAboutClick( productData.data.slug ) }
						item={ itemData }
						isLinkExternal={ true }
						withIcon={ false }
					/>
				</>
			);

			const displayPrice = (
				<Paid
					billingTerm={ TERM_MONTHLY }
					originalPrice={ productData.data.amount }
					currencyCode={ productData.data.currency }
				/>
			);

			return (
				<li key={ productData.data.product_id }>
					<SimpleItemCard
						isCondensedVersion={ true }
						title={ productData.name }
						icon={ icon }
						description={ description }
						price={ displayPrice }
					/>
				</li>
			);
		} );
	};

	return (
		<div className="overview-products">
			<QueryJetpackPartnerPortalPartner />
			<QueryProductsList type="jetpack" currency="USD" />

			{ isLoadingProducts ? (
				<>
					<div className="issue-multiple-licenses-form">
						Loading...
						<div className="issue-multiple-licenses-form__placeholder" />
					</div>
				</>
			) : (
				<>
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
					<ul className="overview-products__items">{ renderProducts() }</ul>
				</>
			) }
		</div>
	);
}
