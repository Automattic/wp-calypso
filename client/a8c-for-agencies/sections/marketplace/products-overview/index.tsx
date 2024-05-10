import page from '@automattic/calypso-router';
import { useBreakpoint } from '@automattic/viewport-react';
import classNames from 'classnames';
import { useTranslate } from 'i18n-calypso';
import { useEffect, useState } from 'react';
import Layout from 'calypso/a8c-for-agencies/components/layout';
import LayoutBody from 'calypso/a8c-for-agencies/components/layout/body';
import LayoutHeader, {
	LayoutHeaderActions as Actions,
	LayoutHeaderTitle as Title,
} from 'calypso/a8c-for-agencies/components/layout/header';
import LayoutTop from 'calypso/a8c-for-agencies/components/layout/top';
import MobileSidebarNavigation from 'calypso/a8c-for-agencies/components/sidebar/mobile-sidebar-navigation';
import { A4A_MARKETPLACE_CHECKOUT_LINK } from 'calypso/a8c-for-agencies/components/sidebar-menu/lib/constants';
import useProductsQuery from 'calypso/a8c-for-agencies/data/marketplace/use-products-query';
import { useSelector } from 'calypso/state';
import getSites from 'calypso/state/selectors/get-sites';
import { ShoppingCartContext } from '../context';
import useShoppingCart from '../hooks/use-shopping-cart';
import ShoppingCart from '../shopping-cart';
import ProductListing from './product-listing';
import type { AssignLicenseProps } from '../types';
import type { SiteDetails } from '@automattic/data-stores';

import './style.scss';

export default function ProductsOverview( { siteId, suggestedProduct }: AssignLicenseProps ) {
	const translate = useTranslate();

	const {
		selectedCartItems,
		setSelectedCartItems,
		onRemoveCartItem,
		showCart,
		setShowCart,
		toggleCart,
	} = useShoppingCart();

	const { isLoading } = useProductsQuery();

	const [ selectedSite, setSelectedSite ] = useState< SiteDetails | null | undefined >( null );

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
			className={ classNames( 'products-overview' ) }
			title={ translate( 'Product Marketplace' ) }
			wide
			withBorder
		>
			<LayoutTop>
				<LayoutHeader showStickyContent={ showStickyContent }>
					<Title>{ translate( 'Marketplace' ) } </Title>

					<Actions className="a4a-marketplace__header-actions">
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
				<ShoppingCartContext.Provider value={ { setSelectedCartItems, selectedCartItems } }>
					<ProductListing selectedSite={ selectedSite } suggestedProduct={ suggestedProduct } />
				</ShoppingCartContext.Provider>
			</LayoutBody>
		</Layout>
	);
}
