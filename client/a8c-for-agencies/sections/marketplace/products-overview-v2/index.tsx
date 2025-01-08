import page from '@automattic/calypso-router';
import { SiteDetails } from '@automattic/data-stores';
import { useBreakpoint } from '@automattic/viewport-react';
import { useTranslate } from 'i18n-calypso';
import { useEffect, useState } from 'react';
import A4AAgencyApprovalNotice from 'calypso/a8c-for-agencies/components/a4a-agency-approval-notice';
import { LayoutWithGuidedTour as Layout } from 'calypso/a8c-for-agencies/components/layout/layout-with-guided-tour';
import LayoutTop from 'calypso/a8c-for-agencies/components/layout/layout-with-payment-notification';
import MobileSidebarNavigation from 'calypso/a8c-for-agencies/components/sidebar/mobile-sidebar-navigation';
import {
	A4A_MARKETPLACE_CHECKOUT_LINK,
	A4A_MARKETPLACE_LINK,
} from 'calypso/a8c-for-agencies/components/sidebar-menu/lib/constants';
import LayoutBody from 'calypso/layout/hosting-dashboard/body';
import LayoutHeader, {
	LayoutHeaderActions as Actions,
	LayoutHeaderBreadcrumb as Breadcrumb,
} from 'calypso/layout/hosting-dashboard/header';
import { useSelector } from 'calypso/state';
import getSites from 'calypso/state/selectors/get-sites';
import ReferralToggle from '../common/referral-toggle';
import { ShoppingCartContext } from '../context';
import withMarketplaceType from '../hoc/with-marketplace-type';
import useShoppingCart from '../hooks/use-shopping-cart';
import ProductListing from '../products-overview/product-listing';
import ShoppingCart from '../shopping-cart';

import './style.scss';

type Props = {
	siteId?: string;
	suggestedProduct?: string;
	productBrand: string;
	searchQuery?: string;
};

export function ProductsOverviewV2( {
	siteId,
	suggestedProduct,
	productBrand,
	searchQuery,
}: Props ) {
	const [ selectedSite, setSelectedSite ] = useState< SiteDetails | null | undefined >( null );

	const translate = useTranslate();

	const isNarrowView = useBreakpoint( '<660px' );

	const sites = useSelector( getSites );

	const {
		selectedCartItems,
		setSelectedCartItems,
		onRemoveCartItem,
		showCart,
		setShowCart,
		toggleCart,
	} = useShoppingCart();

	useEffect( () => {
		if ( siteId && sites.length > 0 ) {
			const site = siteId ? sites.find( ( site ) => site?.ID === parseInt( siteId ) ) : null;
			setSelectedSite( site );
		}
	}, [ siteId, sites ] );

	return (
		<Layout
			className="products-overview-v2"
			title={ isNarrowView ? '' : translate( 'Products Marketplace' ) }
			wide
		>
			<LayoutTop>
				<A4AAgencyApprovalNotice />
				<LayoutHeader>
					<Breadcrumb
						items={ [
							{
								label: translate( 'Marketplace' ),
								href: A4A_MARKETPLACE_LINK,
							},
							{
								label: translate( 'Products' ),
							},
						] }
					/>

					<Actions>
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

			<LayoutBody className="products-overview-v2__body">
				<ShoppingCartContext.Provider value={ { setSelectedCartItems, selectedCartItems } }>
					{
						// we will remove this once we have the new product listing component
						<ProductListing
							selectedSite={ selectedSite }
							suggestedProduct={ suggestedProduct }
							productBrand={ productBrand }
							searchQuery={ searchQuery }
						/>
					}
				</ShoppingCartContext.Provider>
			</LayoutBody>
		</Layout>
	);
}

export default withMarketplaceType( ProductsOverviewV2 );
