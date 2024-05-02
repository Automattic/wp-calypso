import page from '@automattic/calypso-router';
import { Button } from '@automattic/components';
import { Icon, external } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { useCallback } from 'react';
import Layout from 'calypso/a8c-for-agencies/components/layout';
import LayoutBody from 'calypso/a8c-for-agencies/components/layout/body';
import LayoutHeader, {
	LayoutHeaderBreadcrumb as Breadcrumb,
	LayoutHeaderActions as Actions,
} from 'calypso/a8c-for-agencies/components/layout/header';
import LayoutTop from 'calypso/a8c-for-agencies/components/layout/top';
import MobileSidebarNavigation from 'calypso/a8c-for-agencies/components/sidebar/mobile-sidebar-navigation';
import {
	A4A_MARKETPLACE_CHECKOUT_LINK,
	A4A_MARKETPLACE_HOSTING_LINK,
	A4A_MARKETPLACE_HOSTING_PRESSABLE_LINK,
	A4A_MARKETPLACE_LINK,
} from 'calypso/a8c-for-agencies/components/sidebar-menu/lib/constants';
import { useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { APIProductFamilyProduct } from 'calypso/state/partner-portal/types';
import HostingOverview from '../common/hosting-overview';
import useShoppingCart from '../hooks/use-shopping-cart';
import ShoppingCart, { CART_URL_HASH_FRAGMENT } from '../shopping-cart';
import PressableOverviewFeatures from './footer';
import PressableOverviewPlanSelection from './plan-selection';

import './style.scss';

export default function PressableOverview() {
	const translate = useTranslate();
	const dispatch = useDispatch();

	const {
		selectedCartItems,
		setSelectedCartItems,
		onRemoveCartItem,
		showCart,
		setShowCart,
		toggleCart,
	} = useShoppingCart();

	const onAddToCart = useCallback(
		( item: APIProductFamilyProduct ) => {
			// We will need to remove first any existing Pressable plan in the cart as we do not allow multiple Pressable plans to be purchase.
			const items = selectedCartItems?.filter(
				( cartItem ) => cartItem.family_slug !== 'pressable-hosting'
			);

			setSelectedCartItems( [ ...items, { ...item, quantity: 1 } ] );

			page( A4A_MARKETPLACE_HOSTING_PRESSABLE_LINK + CART_URL_HASH_FRAGMENT );
		},
		[ selectedCartItems, setSelectedCartItems ]
	);

	const PRESSABLE_LINK = 'https://pressable.com/';

	const onclickMoreInfo = useCallback( () => {
		dispatch( recordTracksEvent( 'calypso_a4a_marketplace_hosting_pressable_learn_more_click' ) );
	}, [ dispatch ] );

	return (
		<Layout
			className="pressable-overview"
			title={ translate( 'Pressable hosting' ) }
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
								href: A4A_MARKETPLACE_HOSTING_LINK,
							},
							{
								label: translate( 'Pressable hosting' ),
							},
						] }
					/>

					<Actions>
						<MobileSidebarNavigation />
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
				<HostingOverview
					slug="pressable-hosting"
					title={ translate( 'Managed WordPress Hosting' ) }
					subtitle={ translate( 'Scalable plans to help you grow your business.' ) }
				/>
				<PressableOverviewPlanSelection onAddToCart={ onAddToCart } />

				<HostingOverview
					title={ translate( 'The Pressable Promise' ) }
					subtitle={ translate( 'Flexible plans that are designed to grow with your business.' ) }
				/>

				<PressableOverviewFeatures />

				<section className="pressable-overview__footer">
					<Button
						className="pressable-overview__learn-more-link"
						href={ PRESSABLE_LINK }
						onClick={ onclickMoreInfo }
						target="_blank"
						primary
					>
						{ translate( 'Learn more about Pressable' ) } <Icon icon={ external } size={ 18 } />
					</Button>
				</section>
			</LayoutBody>
		</Layout>
	);
}
