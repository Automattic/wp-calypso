// FIXME: Lets decide later if we need to move the calypso/jetpack-cloud imports to a shared common folder.

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
import { useProductBundleSize } from 'calypso/jetpack-cloud/sections/partner-portal/primary/issue-license/hooks/use-product-bundle-size';
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

	const { selectedCartItems, setSelectedCartItems, onRemoveCartItem } = useShoppingCart();

	const [ selectedSite, setSelectedSite ] = useState< SiteDetails | null | undefined >( null );

	const { selectedSize } = useProductBundleSize( true );

	const sites = useSelector( getSites );

	const showStickyContent = useBreakpoint( '>660px' ) && selectedCartItems.length > 0;

	useEffect( () => {
		if ( siteId && sites.length > 0 ) {
			const site = siteId ? sites.find( ( site ) => site?.ID === parseInt( siteId ) ) : null;
			setSelectedSite( site );
		}
	}, [ siteId, sites ] );

	return (
		<Layout
			className={ classNames( 'products-overview' ) }
			title={ translate( 'Product Marketplace' ) }
			wide
			withBorder
			sidebarNavigation={ <MobileSidebarNavigation /> }
		>
			<LayoutTop>
				<LayoutHeader showStickyContent={ showStickyContent }>
					<Title>{ translate( 'Marketplace' ) } </Title>

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
				<ShoppingCartContext.Provider value={ { setSelectedCartItems, selectedCartItems } }>
					<ProductListing
						selectedSite={ selectedSite }
						suggestedProduct={ suggestedProduct }
						quantity={ selectedSize }
					/>
				</ShoppingCartContext.Provider>
			</LayoutBody>
		</Layout>
	);
}
