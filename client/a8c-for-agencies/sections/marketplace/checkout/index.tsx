import { Button } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import Layout from 'calypso/a8c-for-agencies/components/layout';
import LayoutBody from 'calypso/a8c-for-agencies/components/layout/body';
import LayoutHeader, {
	LayoutHeaderBreadcrumb as Breadcrumb,
} from 'calypso/a8c-for-agencies/components/layout/header';
import LayoutTop from 'calypso/a8c-for-agencies/components/layout/top';
import MobileSidebarNavigation from 'calypso/a8c-for-agencies/components/sidebar/mobile-sidebar-navigation';
import { A4A_MARKETPLACE_LINK } from 'calypso/a8c-for-agencies/components/sidebar-menu/lib/constants';
import useShoppingCart from '../hooks/use-shopping-cart';
import { ShoppingCartItem } from '../types';
import PricingSummary from './pricing-summary';

import './style.scss';

export default function Checkout() {
	const translate = useTranslate();
	const { selectedItems, setSelectedItems } = useShoppingCart();

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
					<div className="checkout__content">Checkout here</div>
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
							<Button variant="primary">
								{ translate( 'Purchase %(count)d plan', 'Purchase %(count)d plans', {
									context: 'button label',
									count: selectedItems.length,
									args: {
										count: selectedItems.length,
									},
								} ) }
							</Button>

							<Button variant="secondary">{ translate( 'Continue shopping' ) }</Button>

							<Button variant="link">{ translate( 'Empty cart' ) }</Button>
						</div>
					</div>
				</div>
			</LayoutBody>
		</Layout>
	);
}
