import { isEnabled } from '@automattic/calypso-config';
import page from '@automattic/calypso-router';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import { useCallback } from 'react';
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
import { APIProductFamilyProduct } from 'calypso/state/partner-portal/types';
import ReferralToggle from '../common/referral-toggle';
import withMarketplaceType from '../hoc/with-marketplace-type';
import useShoppingCart from '../hooks/use-shopping-cart';
import ShoppingCart from '../shopping-cart';
import HostingList from './hosting-list';
import HostingV2 from './hosting-v2';

import './style.scss';

function Hosting() {
	const translate = useTranslate();
	const isNewHostingPage = isEnabled( 'a4a-hosting-page-redesign' );

	const {
		selectedCartItems,
		setSelectedCartItems,
		onRemoveCartItem,
		showCart,
		setShowCart,
		toggleCart,
	} = useShoppingCart();

	const onAddToCart = useCallback(
		( plan: APIProductFamilyProduct, quantity: number ) => {
			if ( plan ) {
				const items = selectedCartItems?.filter(
					( cartItem ) => cartItem.family_slug !== 'wpcom-hosting'
				);

				setSelectedCartItems( [ ...items, { ...plan, quantity } ] );
				setShowCart( true );
			}
		},
		[ selectedCartItems, setSelectedCartItems, setShowCart ]
	);

	return (
		<Layout
			className="hosting-overview"
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

			<LayoutBody className={ clsx( { 'is-full-width': isNewHostingPage } ) }>
				{ isNewHostingPage ? <HostingV2 onAddToCart={ onAddToCart } /> : <HostingList /> }
			</LayoutBody>
		</Layout>
	);
}

export default withMarketplaceType( Hosting );
