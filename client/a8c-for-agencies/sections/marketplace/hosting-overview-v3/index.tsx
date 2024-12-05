import page from '@automattic/calypso-router';
import { useBreakpoint } from '@automattic/viewport-react';
import { useTranslate } from 'i18n-calypso';
import { useCallback } from 'react';
import Layout from 'calypso/a8c-for-agencies/components/layout';
import LayoutBody from 'calypso/a8c-for-agencies/components/layout/body';
import LayoutHeader, {
	LayoutHeaderActions as Actions,
	LayoutHeaderBreadcrumb as Breadcrumb,
} from 'calypso/a8c-for-agencies/components/layout/header';
import LayoutTop from 'calypso/a8c-for-agencies/components/layout/top';
import PressableUsageLimitNotice from 'calypso/a8c-for-agencies/components/pressable-usage-limit-notice';
import MobileSidebarNavigation from 'calypso/a8c-for-agencies/components/sidebar/mobile-sidebar-navigation';
import {
	A4A_MARKETPLACE_CHECKOUT_LINK,
	A4A_MARKETPLACE_HOSTING_LINK,
	A4A_MARKETPLACE_LINK,
} from 'calypso/a8c-for-agencies/components/sidebar-menu/lib/constants';
import QueryProductsList from 'calypso/components/data/query-products-list';
import { useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import ReferralToggle from '../common/referral-toggle';
import useShoppingCart from '../hooks/use-shopping-cart';
import ShoppingCart from '../shopping-cart';
import HeroSection from './hero-section';

import './style.scss';

export type SectionProps = {
	section: 'wpcom' | 'pressable' | 'vip';
};

export default function HostingOverviewV3( { section }: SectionProps ) {
	const translate = useTranslate();
	const dispatch = useDispatch();

	const isNarrowView = useBreakpoint( '<660px' );

	const { selectedCartItems, onRemoveCartItem, showCart, setShowCart, toggleCart } =
		useShoppingCart();

	const handleSectionChange = useCallback(
		( tab: string ) => {
			page.show( `${ A4A_MARKETPLACE_HOSTING_LINK }/${ tab }` );
			dispatch( recordTracksEvent( 'calypso_a4a_marketplace_hosting_tab_click', { tab } ) );
		},
		[ dispatch ]
	);

	return (
		<Layout
			className="hosting-overview-v3"
			title={ isNarrowView ? translate( 'Hosting' ) : translate( 'Hosting Marketplace' ) }
			wide
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

			<LayoutBody className="hosting-overview-v3__body">
				<QueryProductsList currency="USD" />

				<HeroSection section={ section } onSectionChange={ handleSectionChange } />
			</LayoutBody>
		</Layout>
	);
}
