import page from '@automattic/calypso-router';
import { SiteDetails } from '@automattic/data-stores';
import { useBreakpoint } from '@automattic/viewport-react';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import { useCallback, useContext, useEffect, useLayoutEffect, useState } from 'react';
import A4AAgencyApprovalNotice from 'calypso/a8c-for-agencies/components/a4a-agency-approval-notice';
import { LayoutWithGuidedTour as Layout } from 'calypso/a8c-for-agencies/components/layout/layout-with-guided-tour';
import LayoutTop from 'calypso/a8c-for-agencies/components/layout/layout-with-payment-notification';
import MobileSidebarNavigation from 'calypso/a8c-for-agencies/components/sidebar/mobile-sidebar-navigation';
import {
	A4A_MARKETPLACE_CHECKOUT_LINK,
	A4A_MARKETPLACE_LINK,
} from 'calypso/a8c-for-agencies/components/sidebar-menu/lib/constants';
import GuidedTour from 'calypso/components/guided-tour';
import { GuidedTourStep } from 'calypso/components/guided-tour/step';
import LayoutHeader, {
	LayoutHeaderActions as Actions,
	LayoutHeaderBreadcrumb as Breadcrumb,
} from 'calypso/layout/hosting-dashboard/header';
import { useDispatch, useSelector } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import getSites from 'calypso/state/selectors/get-sites';
import ReferralToggle from '../common/referral-toggle';
import { PRODUCT_FILTER_KEY_CATEGORIES } from '../constants';
import { MarketplaceTypeContext, ShoppingCartContext } from '../context';
import withMarketplaceType from '../hoc/with-marketplace-type';
import useShoppingCart from '../hooks/use-shopping-cart';
import { useProductBundleSize } from '../products-overview/product-listing/hooks/use-product-bundle-size';
import useSelectedProductFilters from '../products-overview/product-listing/hooks/use-selected-product-filters';
import ShoppingCart from '../shopping-cart';
import useCompactOnScroll from './hooks/use-compact-on-scroll';
import ProductActionPanel from './product-action-panel';
import ProductCategoryMenu from './product-category-menu';
import ProductListing from './product-listing';

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
	const [ referralToggleRef, setReferralToggleRef ] = useState< HTMLElement | null >( null );

	const translate = useTranslate();

	const isNarrowView = useBreakpoint( '<660px' );

	const sites = useSelector( getSites );

	const dispatch = useDispatch();

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

	const { onScroll, isCompact } = useCompactOnScroll();

	const [ productSearchQuery, setProductSearchQuery ] = useState< string >( searchQuery ?? '' );

	const { selectedFilters, setSelectedFilters, resetFilters } = useSelectedProductFilters( {
		productBrand,
	} );

	const { marketplaceType } = useContext( MarketplaceTypeContext );
	const isReferralMode = marketplaceType === 'referral';

	const {
		selectedSize: selectedBundleSize,
		availableSizes: availableBundleSizes,
		setSelectedSize: setSelectedBundleSize,
	} = useProductBundleSize();

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

	const onCategorySelected = useCallback(
		( category: string ) => {
			setSelectedFilters( ( prevFilters ) => ( {
				...prevFilters,
				[ PRODUCT_FILTER_KEY_CATEGORIES ]: {
					[ category ]: true,
				},
			} ) );
			dispatch(
				recordTracksEvent( 'calypso_a4a_marketplace_product_category_selected', {
					category,
				} )
			);
		},
		[ dispatch, setSelectedFilters ]
	);

	return (
		<Layout
			className={ clsx( 'products-overview-v2', { 'is-compact': isCompact } ) }
			title={ isNarrowView ? '' : translate( 'Products Marketplace' ) }
			onScroll={ onScroll }
			wide
		>
			<GuidedTour defaultTourId="marketplaceWalkthrough" />

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
								page( A4A_MARKETPLACE_CHECKOUT_LINK );
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

				<ProductCategoryMenu onSelect={ onCategorySelected } />
			</LayoutTop>

			<ProductActionPanel
				searchQuery={ productSearchQuery }
				onSearchQueryChange={ setProductSearchQuery }
				selectedFilters={ selectedFilters }
				setSelectedFilters={ setSelectedFilters }
				resetSelectedFilters={ resetFilters }
				isReferralMode={ isReferralMode }
				selectedBundleSize={ selectedBundleSize }
				availableBundleSizes={ availableBundleSizes }
				setSelectedBundleSize={ setSelectedBundleSize }
			/>

			<ShoppingCartContext.Provider value={ { setSelectedCartItems, selectedCartItems } }>
				{
					// we will remove this once we have the new product listing component
					<ProductListing
						selectedSite={ selectedSite }
						suggestedProduct={ suggestedProduct }
						productBrand={ productBrand }
						productSearchQuery={ productSearchQuery }
						isReferralMode={ isReferralMode }
						selectedBundleSize={ selectedBundleSize }
						selectedFilters={ selectedFilters }
					/>
				}
			</ShoppingCartContext.Provider>
		</Layout>
	);
}

export default withMarketplaceType( ProductsOverviewV2 );
