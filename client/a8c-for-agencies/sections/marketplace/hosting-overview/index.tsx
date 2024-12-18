import { isEnabled } from '@automattic/calypso-config';
import page from '@automattic/calypso-router';
import { useBreakpoint } from '@automattic/viewport-react';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import { useCallback } from 'react';
import { LayoutWithGuidedTour as Layout } from 'calypso/a8c-for-agencies/components/layout/layout-with-guided-tour';
import PressableUsageLimitNotice from 'calypso/a8c-for-agencies/components/pressable-usage-limit-notice';
import MobileSidebarNavigation from 'calypso/a8c-for-agencies/components/sidebar/mobile-sidebar-navigation';
import {
	A4A_MARKETPLACE_CHECKOUT_LINK,
	A4A_MARKETPLACE_LINK,
} from 'calypso/a8c-for-agencies/components/sidebar-menu/lib/constants';
import QueryProductsList from 'calypso/components/data/query-products-list';
import LayoutBody from 'calypso/layout/multi-sites-dashboard/body';
import LayoutHeader, {
	LayoutHeaderActions as Actions,
	LayoutHeaderBreadcrumb as Breadcrumb,
} from 'calypso/layout/multi-sites-dashboard/header';
import LayoutTop from 'calypso/layout/multi-sites-dashboard/top';
import { useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import ReferralToggle from '../common/referral-toggle';
import withMarketplaceType from '../hoc/with-marketplace-type';
import useShoppingCart from '../hooks/use-shopping-cart';
import ShoppingCart from '../shopping-cart';
import HostingList from './hosting-list';
import HostingV2 from './hosting-v2';
import type { APIProductFamilyProduct } from 'calypso/state/partner-portal/types';

import './style.scss';

type Props = {
	section: 'wpcom' | 'pressable' | 'vip';
};

function Hosting( { section }: Props ) {
	const translate = useTranslate();
	const dispatch = useDispatch();

	const isNewHostingPage = isEnabled( 'a4a-hosting-page-redesign' );

	const isNarrowView = useBreakpoint( '<660px' );

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
				const items =
					plan.family_slug === 'wpcom-hosting' || plan.family_slug === 'pressable-hosting'
						? selectedCartItems?.filter( ( cartItem ) => cartItem.family_slug !== plan.family_slug )
						: selectedCartItems;

				setSelectedCartItems( [ ...items, { ...plan, quantity } ] );
				setShowCart( true );
				dispatch(
					recordTracksEvent( 'calypso_a4a_marketplace_hosting_add_to_cart', {
						quantity,
						item: plan.family_slug,
					} )
				);
			}
		},
		[ dispatch, selectedCartItems, setSelectedCartItems, setShowCart ]
	);

	return (
		<Layout
			className="hosting-overview"
			title={ isNarrowView ? translate( 'Hosting' ) : translate( 'Hosting Marketplace' ) }
			wide
			withBorder
		>
			<LayoutTop>
				<PressableUsageLimitNotice />
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
				<QueryProductsList currency="USD" />
				{ isNewHostingPage ? (
					<HostingV2 section={ section } onAddToCart={ onAddToCart } />
				) : (
					<HostingList />
				) }
			</LayoutBody>
		</Layout>
	);
}

export default withMarketplaceType( Hosting );
