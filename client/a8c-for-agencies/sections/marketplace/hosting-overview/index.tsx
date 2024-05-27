import { isEnabled } from '@automattic/calypso-config';
import page from '@automattic/calypso-router';
import { Gridicon } from '@automattic/components';
import { ToggleControl } from '@wordpress/components';
import classNames from 'classnames';
import { useTranslate } from 'i18n-calypso';
import { useContext } from 'react';
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
import { MarketplaceTypeContext } from '../context';
import withMarketplaceType from '../hoc/with-marketplace-type';
import useShoppingCart from '../hooks/use-shopping-cart';
import ShoppingCart from '../shopping-cart';
import HostingList from './hosting-list';

function Hosting() {
	const isAutomatedReferrals = isEnabled( 'a4a-automated-referrals' );
	const translate = useTranslate();

	const { marketplaceType, toggleMarketplaceType } = useContext( MarketplaceTypeContext );
	const { selectedCartItems, onRemoveCartItem, showCart, setShowCart, toggleCart } =
		useShoppingCart();

	return (
		<Layout
			className={ classNames( 'hosting-overview' ) }
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
						{ isAutomatedReferrals && (
							<div className="a4a-marketplace__toggle-marketplace-type">
								<ToggleControl
									onChange={ toggleMarketplaceType }
									checked={ marketplaceType === 'referral' }
									id="a4a-marketplace__toggle-marketplace-type"
									label={ translate( 'Refer products' ) }
								/>
								<Gridicon icon="info-outline" size={ 16 } />
							</div>
						) }
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

			<LayoutBody>
				<HostingList />
			</LayoutBody>
		</Layout>
	);
}

export default withMarketplaceType( Hosting );
