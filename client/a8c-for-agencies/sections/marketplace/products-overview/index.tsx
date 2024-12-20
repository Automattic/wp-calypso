import page from '@automattic/calypso-router';
import { useBreakpoint } from '@automattic/viewport-react';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import { useEffect, useState } from 'react';
import { LayoutWithGuidedTour as Layout } from 'calypso/a8c-for-agencies/components/layout/layout-with-guided-tour';
import MobileSidebarNavigation from 'calypso/a8c-for-agencies/components/sidebar/mobile-sidebar-navigation';
import {
	A4A_MARKETPLACE_CHECKOUT_LINK,
	A4A_MARKETPLACE_LINK,
} from 'calypso/a8c-for-agencies/components/sidebar-menu/lib/constants';
import useProductsQuery from 'calypso/a8c-for-agencies/data/marketplace/use-products-query';
import LayoutBody from 'calypso/layout/multi-sites-dashboard/body';
import LayoutHeader, {
	LayoutHeaderActions as Actions,
	LayoutHeaderBreadcrumb as Breadcrumb,
} from 'calypso/layout/multi-sites-dashboard/header';
import LayoutTop from 'calypso/layout/multi-sites-dashboard/top';
import { useSelector } from 'calypso/state';
import getSites from 'calypso/state/selectors/get-sites';
import ReferralToggle from '../common/referral-toggle';
import { ShoppingCartContext } from '../context';
import withMarketplaceType from '../hoc/with-marketplace-type';
import useShoppingCart from '../hooks/use-shopping-cart';
import ShoppingCart from '../shopping-cart';
import ProductListing from './product-listing';
import ProductNavigation from './product-navigation';
import type { SiteDetails } from '@automattic/data-stores';

import './style.scss';

type Props = {
	siteId?: string;
	suggestedProduct?: string;
	productBrand: string;
	searchQuery?: string;
};

function ProductsOverview( { siteId, suggestedProduct, productBrand, searchQuery }: Props ) {
	const translate = useTranslate();

	const [ selectedSite, setSelectedSite ] = useState< SiteDetails | null | undefined >( null );

	const {
		selectedCartItems,
		setSelectedCartItems,
		onRemoveCartItem,
		showCart,
		setShowCart,
		toggleCart,
	} = useShoppingCart();

	const { isLoading } = useProductsQuery();

	const sites = useSelector( getSites );

	const showStickyContent = useBreakpoint( '>660px' ) && selectedCartItems.length > 0;

	useEffect( () => {
		if ( siteId && sites.length > 0 ) {
			const site = siteId ? sites.find( ( site ) => site?.ID === parseInt( siteId ) ) : null;
			setSelectedSite( site );
		}
	}, [ siteId, sites ] );

	useEffect( () => {
		if ( window.location.hash && ! isLoading ) {
			const target = window.location.hash.replace( '#', '' );
			const element = document.getElementById( target );

			if ( element ) {
				element.scrollIntoView( {
					behavior: 'smooth',
					block: 'start',
				} );
			}
		}
	}, [ isLoading ] );

	return (
		<Layout
			className={ clsx( 'products-overview' ) }
			title={ translate( 'Product Marketplace' ) }
			wide
			withBorder
		>
			<LayoutTop withNavigation>
				<LayoutHeader showStickyContent={ showStickyContent }>
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

				<ProductNavigation selectedTab={ productBrand } />
			</LayoutTop>

			<LayoutBody>
				<ShoppingCartContext.Provider value={ { setSelectedCartItems, selectedCartItems } }>
					<ProductListing
						selectedSite={ selectedSite }
						suggestedProduct={ suggestedProduct }
						productBrand={ productBrand }
						searchQuery={ searchQuery }
					/>
				</ShoppingCartContext.Provider>
			</LayoutBody>
		</Layout>
	);
}

export default withMarketplaceType( ProductsOverview );
