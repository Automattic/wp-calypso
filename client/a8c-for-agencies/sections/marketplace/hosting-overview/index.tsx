import { isEnabled } from '@automattic/calypso-config';
import page from '@automattic/calypso-router';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import Layout from 'calypso/a8c-for-agencies/components/layout';
import LayoutBody from 'calypso/a8c-for-agencies/components/layout/body';
import LayoutHeader, {
	LayoutHeaderActions as Actions,
	LayoutHeaderBreadcrumb as Breadcrumb,
} from 'calypso/a8c-for-agencies/components/layout/header';
import LayoutTop from 'calypso/a8c-for-agencies/components/layout/top';
import MobileSidebarNavigation from 'calypso/a8c-for-agencies/components/sidebar/mobile-sidebar-navigation';
import {
	A4A_MARKETPLACE_CHECKOUT_LINK,
	A4A_MARKETPLACE_LINK,
} from 'calypso/a8c-for-agencies/components/sidebar-menu/lib/constants';
import ReferralToggle from '../common/referral-toggle';
import withMarketplaceType from '../hoc/with-marketplace-type';
import useShoppingCart from '../hooks/use-shopping-cart';
import ShoppingCart from '../shopping-cart';
import HostingList from './hosting-list';
import HostingV2 from './hosting-v2';

function Hosting() {
	const translate = useTranslate();
	const isNewHostingPage = isEnabled( 'a4a-hosting-page-redesign' );

	const { selectedCartItems, onRemoveCartItem, showCart, setShowCart, toggleCart } =
		useShoppingCart();

	return (
		<Layout
			className={ clsx( 'hosting-overview' ) }
			title={ translate( 'Hosting Marketplace' ) }
			wide
			withBorder
			compact
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
								label: translate( 'Hosting' ),
							},
						] }
					/>

					<Actions className="a4a-marketplace__header-actions">
						<MobileSidebarNavigation />
						<ReferralToggle />
						<ShoppingCart
							showCart={ showCart }
							setShowCart={ setShowCart }
							toggleCart={ toggleCart }
							items={ selectedCartItems }
							onRemoveItem={ onRemoveCartItem }
							onCheckout={ () => {
								page( A4A_MARKETPLACE_CHECKOUT_LINK );
							} }
						/>
					</Actions>
				</LayoutHeader>
			</LayoutTop>

			<LayoutBody>{ isNewHostingPage ? <HostingV2 /> : <HostingList /> }</LayoutBody>
		</Layout>
	);
}

export default withMarketplaceType( Hosting );
