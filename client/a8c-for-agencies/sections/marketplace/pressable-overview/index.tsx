import page from '@automattic/calypso-router';
import { useTranslate } from 'i18n-calypso';
import { useCallback, useEffect, useState } from 'react';
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
	A4A_MARKETPLACE_LINK,
} from 'calypso/a8c-for-agencies/components/sidebar-menu/lib/constants';
import { APIProductFamilyProduct } from 'calypso/state/partner-portal/types';
import useProductAndPlans from '../hooks/use-product-and-plans';
import useShoppingCart from '../hooks/use-shopping-cart';
import { getHostingLogo } from '../lib/hosting';
import ShoppingCart from '../shopping-cart';
import PressableOverviewFeatures from './features';
import PressableOverviewFilter from './filter';
import PressableOverviewPlanDetails from './plan-details';

import './style.scss';

export default function PressableOverview() {
	const translate = useTranslate();

	const { selectedCartItems, onRemoveCartItem } = useShoppingCart();

	const { pressablePlans } = useProductAndPlans( {
		selectedSite: null,
		productSearchQuery: '',
	} );

	const [ selectedPlan, setSelectedPlan ] = useState< APIProductFamilyProduct | null >( null );

	const onSelectPlan = useCallback(
		( plan: APIProductFamilyProduct | null ) => {
			setSelectedPlan( plan );
		},
		[ setSelectedPlan ]
	);

	useEffect( () => {
		if ( pressablePlans?.length ) {
			setSelectedPlan( pressablePlans[ 0 ] );
		}
	}, [ pressablePlans, setSelectedPlan ] );

	return (
		<Layout
			className="pressable-overview"
			title={ translate( 'Pressable hosting' ) }
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
								label: translate( 'Hosting' ),
								href: A4A_MARKETPLACE_HOSTING_LINK,
							},
							{
								label: translate( 'Pressable hosting' ),
							},
						] }
					/>

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
			</LayoutTop>

			<LayoutBody>
				<section className="pressable-overview__banner">
					<div className="pressable-overview__banner-logo">
						{ getHostingLogo( 'pressable-hosting' ) }
					</div>

					<h1 className="pressable-overview__banner-title">
						{ translate( 'Managed WordPress Hosting' ) }
					</h1>

					<h2 className="pressable-overview__banner-subtitle">
						{ translate( 'Scalable plans to help you grow your business.' ) }
					</h2>
				</section>

				<PressableOverviewFilter
					selectedPlan={ selectedPlan }
					plans={ pressablePlans }
					onSelectPlan={ onSelectPlan }
				/>

				<PressableOverviewPlanDetails
					selectedPlan={ selectedPlan }
					onSelectPlan={ () => {
						//FIXME: add to cart
					} }
				/>

				<PressableOverviewFeatures />
			</LayoutBody>
		</Layout>
	);
}
