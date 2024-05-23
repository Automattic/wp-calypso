import { isEnabled } from '@automattic/calypso-config';
import page from '@automattic/calypso-router';
import { Gridicon } from '@automattic/components';
import { useBreakpoint } from '@automattic/viewport-react';
import { ToggleControl } from '@wordpress/components';
import classNames from 'classnames';
import { useTranslate } from 'i18n-calypso';
import { useEffect, useState } from 'react';
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
import useProductsQuery from 'calypso/a8c-for-agencies/data/marketplace/use-products-query';
import { useSelector } from 'calypso/state';
import getSites from 'calypso/state/selectors/get-sites';
import { MarketplaceTypeContext, ShoppingCartContext } from '../context';
import useShoppingCart from '../hooks/use-shopping-cart';
import ShoppingCart from '../shopping-cart';
import ProductListing from './product-listing';
import ProductNavigation from './product-navigation';
import type { MarketplaceType } from '../types';
import type { SiteDetails } from '@automattic/data-stores';

import './style.scss';

type Props = {
	siteId?: string;
	suggestedProduct?: string;
	productBrand: string;
	purchaseType?: MarketplaceType;
};

export default function ProductsOverview( {
	siteId,
	suggestedProduct,
	productBrand,
	purchaseType = 'regular',
}: Props ) {
	const translate = useTranslate();

	const isAutomatedReferrals = isEnabled( 'a4a-automated-referrals' );
	const [ selectedSite, setSelectedSite ] = useState< SiteDetails | null | undefined >( null );
	const [ marketplaceType, setMarketplaceType ] = useState< MarketplaceType >(
		isAutomatedReferrals ? purchaseType : 'regular'
	);

	const {
		selectedCartItems,
		setSelectedCartItems,
		setMarketplaceType: setCartMarketplaceType,
		onRemoveCartItem,
		showCart,
		setShowCart,
		toggleCart,
	} = useShoppingCart( marketplaceType );

	const { isLoading } = useProductsQuery();

	const toggleMarketplaceType = () => {
		if ( ! isAutomatedReferrals ) {
			return;
		}
		const nextType = marketplaceType === 'regular' ? 'referral' : 'regular';
		setMarketplaceType( nextType );
		setCartMarketplaceType( nextType );
	};

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
			compact
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
						{ isAutomatedReferrals && (
							<div className="a4a-marketplace__toggle-marketplace-type">
								<ToggleControl
									onChange={ toggleMarketplaceType }
									checked={ marketplaceType === 'referral' }
									id="a4a-marketplace__toggle-marketplace-type"
									label={ translate( 'Refer products' ) }
								/>
								<Gridicon icon="info-outline" size={ 16 } />
							</div>
						) }
						<ShoppingCart
							showCart={ showCart }
							setShowCart={ setShowCart }
							toggleCart={ toggleCart }
							items={ selectedCartItems }
							onRemoveItem={ onRemoveCartItem }
							onCheckout={ () => {
								page( A4A_MARKETPLACE_CHECKOUT_LINK );
							} }
							marketplaceType={ marketplaceType }
						/>
					</Actions>
				</LayoutHeader>

				<ProductNavigation selectedTab={ productBrand } />
			</LayoutTop>

			<LayoutBody>
				<MarketplaceTypeContext.Provider value={ { marketplaceType } }>
					<ShoppingCartContext.Provider value={ { setSelectedCartItems, selectedCartItems } }>
						<ProductListing
							selectedSite={ selectedSite }
							suggestedProduct={ suggestedProduct }
							productBrand={ productBrand }
						/>
					</ShoppingCartContext.Provider>
				</MarketplaceTypeContext.Provider>
			</LayoutBody>
		</Layout>
	);
}
