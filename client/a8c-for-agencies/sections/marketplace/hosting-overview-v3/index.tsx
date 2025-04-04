import page from '@automattic/calypso-router';
import { useBreakpoint } from '@automattic/viewport-react';
import { useTranslate } from 'i18n-calypso';
import { useCallback, useLayoutEffect, useState } from 'react';
import A4AAgencyApprovalNotice from 'calypso/a8c-for-agencies/components/a4a-agency-approval-notice';
import { LayoutWithGuidedTour as Layout } from 'calypso/a8c-for-agencies/components/layout/layout-with-guided-tour';
import LayoutTop from 'calypso/a8c-for-agencies/components/layout/layout-with-payment-notification';
import PressableUsageLimitNotice from 'calypso/a8c-for-agencies/components/pressable-usage-limit-notice';
import MobileSidebarNavigation from 'calypso/a8c-for-agencies/components/sidebar/mobile-sidebar-navigation';
import {
	A4A_MARKETPLACE_CHECKOUT_LINK,
	A4A_MARKETPLACE_HOSTING_LINK,
	A4A_MARKETPLACE_LINK,
} from 'calypso/a8c-for-agencies/components/sidebar-menu/lib/constants';
import QueryProductsList from 'calypso/components/data/query-products-list';
import GuidedTour from 'calypso/components/guided-tour';
import { GuidedTourStep } from 'calypso/components/guided-tour/step';
import LayoutBody from 'calypso/layout/hosting-dashboard/body';
import LayoutHeader, {
	LayoutHeaderActions as Actions,
	LayoutHeaderBreadcrumb as Breadcrumb,
} from 'calypso/layout/hosting-dashboard/header';
import { useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { APIProductFamilyProduct } from 'calypso/state/partner-portal/types';
import ReferralToggle from '../common/referral-toggle';
import withMarketplaceType from '../hoc/with-marketplace-type';
import useShoppingCart from '../hooks/use-shopping-cart';
import ShoppingCart from '../shopping-cart';
import HeroSection from './hero-section';
import useCompactOnScroll from './hooks/use-compact-on-scroll';
import { HostingContent } from './hosting-content';

import './style.scss';

export type SectionProps = {
	section: 'wpcom' | 'pressable' | 'vip';
};

function HostingOverviewV3( { section }: SectionProps ) {
	const translate = useTranslate();
	const dispatch = useDispatch();

	const isNarrowView = useBreakpoint( '<660px' );

	const [ referralToggleRef, setReferralToggleRef ] = useState< HTMLElement | null >();

	const {
		selectedCartItems,
		onRemoveCartItem,
		showCart,
		setShowCart,
		toggleCart,
		setSelectedCartItems,
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

	const handleSectionChange = useCallback(
		( tab: string ) => {
			page.show( `${ A4A_MARKETPLACE_HOSTING_LINK }/${ tab }` );
			dispatch( recordTracksEvent( 'calypso_a4a_marketplace_hosting_tab_click', { tab } ) );
		},
		[ dispatch ]
	);

	const { onScroll, isCompact, ref: heroSectionRef } = useCompactOnScroll();

	const [ sidebarRef, setSidebarRef ] = useState< HTMLElement | null >( null );

	/* Currently, there is no way for us to have a shared context between the Sidebar and Toggle component which both uses the same guided tour context.
	 * And both components need to reside on the same Node Tree where the guided tour context is available. However, this is impossible with how we have
	 * structured the page layout in Calypso.
	 *
	 * To solve this issue, we are querying the DOM to get the sidebar element for us to anchor our guided tour popover.
	 */
	useLayoutEffect( () => {
		setTimeout( () => {
			setSidebarRef( document.querySelector( '.sidebar-v2__navigator-sub-menu' ) as HTMLElement );
		}, 300 );
	}, [ sidebarRef ] );

	return (
		<Layout
			className="hosting-overview-v3"
			title={ isNarrowView ? '' : translate( 'Hosting Marketplace' ) }
			onScroll={ onScroll }
			wide
		>
			<GuidedTour defaultTourId="marketplaceWalkthrough" />

			<LayoutTop>
				<PressableUsageLimitNotice />
				<A4AAgencyApprovalNotice />
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
						hideOnMobile
					/>
					<Actions className="a4a-marketplace__header-actions">
						<MobileSidebarNavigation />
						<div ref={ ( ref ) => setReferralToggleRef( ref as HTMLElement | null ) }>
							<ReferralToggle />
						</div>
						<ShoppingCart
							showCart={ showCart }
							setShowCart={ setShowCart }
							toggleCart={ toggleCart }
							items={ selectedCartItems }
							onRemoveItem={ onRemoveCartItem }
							onCheckout={ () => {
								page.redirect( A4A_MARKETPLACE_CHECKOUT_LINK );
							} }
						/>

						<GuidedTourStep
							className="a4a-marketplace__guided-tour"
							id="marketplace-walkthrough-navigation"
							tourId="marketplaceWalkthrough"
							context={ sidebarRef }
						/>

						<GuidedTourStep
							className="a4a-marketplace__guided-tour"
							id="marketplace-walkthrough-referral-toggle"
							tourId="marketplaceWalkthrough"
							context={ referralToggleRef }
						/>
					</Actions>
				</LayoutHeader>
				<HeroSection
					section={ section }
					onSectionChange={ handleSectionChange }
					isCompact={ isCompact }
					ref={ heroSectionRef }
				/>
			</LayoutTop>

			<LayoutBody className="hosting-overview-v3__body">
				<QueryProductsList currency="USD" />

				{ section && <HostingContent section={ section } onAddToCart={ onAddToCart } /> }
			</LayoutBody>
		</Layout>
	);
}

export default withMarketplaceType( HostingOverviewV3 );
