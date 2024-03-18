import page from '@automattic/calypso-router';
import { Button } from '@automattic/components';
import { SiteDetails } from '@automattic/data-stores';
import { getQueryArg } from '@wordpress/url';
import { useTranslate } from 'i18n-calypso';
import { useCallback, useMemo, useState } from 'react';
import Layout from 'calypso/a8c-for-agencies/components/layout';
import LayoutBody from 'calypso/a8c-for-agencies/components/layout/body';
import LayoutHeader, {
	LayoutHeaderBreadcrumb as Breadcrumb,
} from 'calypso/a8c-for-agencies/components/layout/header';
import LayoutTop from 'calypso/a8c-for-agencies/components/layout/top';
import MobileSidebarNavigation from 'calypso/a8c-for-agencies/components/sidebar/mobile-sidebar-navigation';
import { A4A_MARKETPLACE_LINK } from 'calypso/a8c-for-agencies/components/sidebar-menu/lib/constants';
import { useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import useShoppingCart from '../hooks/use-shopping-cart';
import useSubmitForm from '../products-overview/product-listing/hooks/use-submit-form';
import { ShoppingCartItem } from '../types';
import PricingSummary from './pricing-summary';
import ProductInfo from './product-info';

import './style.scss';

export default function Checkout() {
	const translate = useTranslate();
	const dispatch = useDispatch();

	const { selectedItems, setSelectedItems } = useShoppingCart();

	const [ selectedSite ] = useState< SiteDetails | null | undefined >( null ); // FIXME: Need to fetch from state

	// We need the suggested products (i.e., the products chosen from the dashboard) to properly
	// track if the user purchases a different set of products.
	const suggestedProductSlugs = getQueryArg( window.location.href, 'product_slug' )
		?.toString()
		.split( ',' );

	const { isReady, submitForm } = useSubmitForm( selectedSite, suggestedProductSlugs );

	const sortedSelectedItems = useMemo( () => {
		return Object.values(
			selectedItems.reduce(
				( acc: Record< string, ShoppingCartItem[] >, item ) => (
					( acc[ item.slug ] = ( acc[ item.slug ] || [] ).concat( item ) ), acc
				),
				{}
			)
		)
			.map( ( group ) => group.sort( ( a, b ) => a.quantity - b.quantity ) )
			.flat();
	}, [ selectedItems ] );

	const onCheckout = useCallback( () => {
		dispatch( recordTracksEvent( 'calypso_a4a_marketplace_checkout_checkout_click' ) );

		submitForm( sortedSelectedItems );

		dispatch(
			recordTracksEvent( 'calypso_a4a_marketplace_checkout_checkout_click', {
				total_licenses: sortedSelectedItems.length,
				items: sortedSelectedItems
					?.map( ( item ) => `${ item.slug } x ${ item.quantity }` )
					.join( ',' ),
			} )
		);
	}, [ dispatch, sortedSelectedItems, submitForm ] );

	const onEmptyCart = useCallback( () => {
		dispatch( recordTracksEvent( 'calypso_a4a_marketplace_checkout_empty_cart_click' ) );
		setSelectedItems( [] );
		page( A4A_MARKETPLACE_LINK );
	}, [ dispatch, setSelectedItems ] );

	const onContinueShopping = useCallback( () => {
		dispatch( recordTracksEvent( 'calypso_a4a_marketplace_checkout_continue_shopping_click' ) );
		page( A4A_MARKETPLACE_LINK );
	}, [ dispatch ] );

	return (
		<Layout
			className="checkout"
			title={ translate( 'Checkout' ) }
			wide
			withBorder
			compact
			sidebarNavigation={ <MobileSidebarNavigation /> }
		>
			<LayoutTop>
				<LayoutHeader>
					<Breadcrumb
						items={ [
							{
								label: translate( 'Marketplace' ),
								href: A4A_MARKETPLACE_LINK,
							},
							{
								label: translate( 'Checkout' ),
							},
						] }
					/>
				</LayoutHeader>
			</LayoutTop>

			<LayoutBody>
				<div className="checkout__container">
					<div className="checkout__main">
						<h1 className="checkout__main-title">{ translate( 'Checkout' ) }</h1>

						<div className="checkout__main-list">
							{ sortedSelectedItems.map( ( items ) => (
								<ProductInfo
									key={ `product-info-${ items.product_id }-${ items.quantity }` }
									product={ items }
								/>
							) ) }
						</div>
					</div>
					<div className="checkout__aside">
						<PricingSummary
							items={ sortedSelectedItems }
							onRemoveItem={ ( item: ShoppingCartItem ) => {
								setSelectedItems(
									sortedSelectedItems.filter( ( selectedItem ) => selectedItem !== item )
								);
							} }
						/>

						<div className="checkout__aside-actions">
							<Button
								primary
								onClick={ onCheckout }
								disabled={ ! sortedSelectedItems.length || ! isReady }
								busy={ ! isReady }
							>
								{ translate( 'Purchase %(count)d plan', 'Purchase %(count)d plans', {
									context: 'button label',
									count: sortedSelectedItems.length,
									args: {
										count: sortedSelectedItems.length,
									},
								} ) }
							</Button>

							<Button onClick={ onContinueShopping }>{ translate( 'Continue shopping' ) }</Button>

							<Button borderless onClick={ onEmptyCart }>
								{ translate( 'Empty cart' ) }
							</Button>
						</div>
					</div>
				</div>
			</LayoutBody>
		</Layout>
	);
}
