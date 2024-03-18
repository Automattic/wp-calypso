import page from '@automattic/calypso-router';
import { Button } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useCallback } from 'react';
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
import { ShoppingCartItem } from '../types';
import PricingSummary from './pricing-summary';
import ProductInfo from './product-info';

import './style.scss';

export default function Checkout() {
	const translate = useTranslate();
	const dispatch = useDispatch();

	const { selectedItems, setSelectedItems } = useShoppingCart();

	const onCheckout = useCallback( () => {
		dispatch( recordTracksEvent( 'calypso_a4a_marketplace_checkout_checkout_click' ) );

		// FIXME: Issue license
	}, [ dispatch ] );

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
							{ selectedItems.map( ( items ) => (
								<ProductInfo
									key={ `product-info-${ items.product_id }-${ items.quantity }` }
									product={ items }
								/>
							) ) }
						</div>
					</div>
					<div className="checkout__aside">
						<PricingSummary
							items={ selectedItems }
							onRemoveItem={ ( item: ShoppingCartItem ) => {
								setSelectedItems(
									selectedItems.filter( ( selectedItem ) => selectedItem !== item )
								);
							} }
						/>

						<div className="checkout__aside-actions">
							<Button variant="primary" onClick={ onCheckout } disabled={ ! selectedItems.length }>
								{ translate( 'Purchase %(count)d plan', 'Purchase %(count)d plans', {
									context: 'button label',
									count: selectedItems.length,
									args: {
										count: selectedItems.length,
									},
								} ) }
							</Button>

							<Button variant="secondary" onClick={ onContinueShopping }>
								{ translate( 'Continue shopping' ) }
							</Button>

							<Button variant="link" onClick={ onEmptyCart }>
								{ translate( 'Empty cart' ) }
							</Button>
						</div>
					</div>
				</div>
			</LayoutBody>
		</Layout>
	);
}
