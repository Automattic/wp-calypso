import page from '@automattic/calypso-router';
import { useBreakpoint } from '@automattic/viewport-react';
import classNames from 'classnames';
import { useTranslate } from 'i18n-calypso';
import Layout from 'calypso/a8c-for-agencies/components/layout';
import LayoutBody from 'calypso/a8c-for-agencies/components/layout/body';
import LayoutHeader, {
	LayoutHeaderTitle as Title,
	LayoutHeaderActions as Actions,
} from 'calypso/a8c-for-agencies/components/layout/header';
import LayoutTop from 'calypso/a8c-for-agencies/components/layout/top';
import MobileSidebarNavigation from 'calypso/a8c-for-agencies/components/sidebar/mobile-sidebar-navigation';
import { A4A_MARKETPLACE_CHECKOUT_LINK } from 'calypso/a8c-for-agencies/components/sidebar-menu/lib/constants';
import useShoppingCart from '../hooks/use-shopping-cart';
import ShoppingCart from '../shopping-cart';
import HostingList from './hosting-list';

export default function Hosting() {
	const translate = useTranslate();

	const { selectedCartItems, onRemoveCartItem } = useShoppingCart();
	const isNarrowView = useBreakpoint( '<660px' );

	return (
		<Layout
			className={ classNames( 'hosting-overview' ) }
			title={ translate( 'Hosting Marketplace' ) }
			wide
			withBorder
		>
			<LayoutTop>
				{ ! isNarrowView ? (
					<LayoutHeader>
						<Title>{ translate( 'Marketplace' ) }</Title>

						<Actions>
							<ShoppingCart
								items={ selectedCartItems }
								onRemoveItem={ onRemoveCartItem }
								onCheckout={ () => {
									page( A4A_MARKETPLACE_CHECKOUT_LINK );
								} }
							/>
						</Actions>
					</LayoutHeader>
				) : (
					<Actions className="a4a-layout-header-mobile">
						<MobileSidebarNavigation />
						<ShoppingCart
							items={ selectedCartItems }
							onRemoveItem={ onRemoveCartItem }
							onCheckout={ () => {
								page( A4A_MARKETPLACE_CHECKOUT_LINK );
							} }
						/>
					</Actions>
				) }
			</LayoutTop>

			<LayoutBody>
				<HostingList />
			</LayoutBody>
		</Layout>
	);
}
