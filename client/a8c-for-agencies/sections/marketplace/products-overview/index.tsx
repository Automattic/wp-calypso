// FIXME: Lets decide later if we need to move the calypso/jetpack-cloud imports to a shared common folder.

import { useBreakpoint } from '@automattic/viewport-react';
import { getQueryArg } from '@wordpress/url';
import classNames from 'classnames';
import { useTranslate } from 'i18n-calypso';
import { useCallback, useEffect, useState } from 'react';
import Layout from 'calypso/a8c-for-agencies/components/layout';
import LayoutBody from 'calypso/a8c-for-agencies/components/layout/body';
import LayoutHeader, {
	LayoutHeaderActions as Actions,
	LayoutHeaderTitle as Title,
} from 'calypso/a8c-for-agencies/components/layout/header';
import LayoutTop from 'calypso/a8c-for-agencies/components/layout/top';
import MobileSidebarNavigation from 'calypso/a8c-for-agencies/components/sidebar/mobile-sidebar-navigation';
import { useProductBundleSize } from 'calypso/jetpack-cloud/sections/partner-portal/primary/issue-license/hooks/use-product-bundle-size';
import ReviewLicenses from 'calypso/jetpack-cloud/sections/partner-portal/primary/issue-license/review-licenses';
import { useDispatch, useSelector } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import getSites from 'calypso/state/selectors/get-sites';
import { ShoppingCartContext } from '../context';
import useShoppingCart from '../hooks/use-shopping-cart';
import ShoppingCart from '../shopping-cart';
import ProductListing from './product-listing';
import useSubmitForm from './product-listing/hooks/use-submit-form';
import type { AssignLicenseProps, ShoppingCartItem } from '../types';
import type { SiteDetails } from '@automattic/data-stores';

import './style.scss';

export default function ProductsOverview( { siteId, suggestedProduct }: AssignLicenseProps ) {
	const translate = useTranslate();
	const dispatch = useDispatch();

	const { selectedCartItems, setSelectedCartItems, onRemoveCartItem } = useShoppingCart();

	const [ selectedSite, setSelectedSite ] = useState< SiteDetails | null | undefined >( null );
	const [ showReviewLicenses, setShowReviewLicenses ] = useState< boolean >( false );

	const { selectedSize } = useProductBundleSize( true );

	// We need the suggested products (i.e., the products chosen from the dashboard) to properly
	// track if the user purchases a different set of products.
	const suggestedProductSlugs = getQueryArg( window.location.href, 'product_slug' )
		?.toString()
		.split( ',' );

	const { isReady, submitForm } = useSubmitForm( selectedSite, suggestedProductSlugs );

	const onDismissReviewLicensesModal = useCallback( () => {
		setShowReviewLicenses( false );
		dispatch( recordTracksEvent( 'calypso_a4a_products_overview_review_licenses_dimiss' ) );
	}, [ dispatch ] );

	const sites = useSelector( getSites );

	const showStickyContent = useBreakpoint( '>660px' ) && selectedCartItems.length > 0;

	useEffect( () => {
		if ( siteId && sites.length > 0 ) {
			const site = siteId ? sites.find( ( site ) => site?.ID === parseInt( siteId ) ) : null;
			setSelectedSite( site );
		}
	}, [ siteId, sites ] );

	// Group licenses by slug and sort them by quantity
	const getGroupedLicenses = useCallback( () => {
		return Object.values(
			selectedCartItems.reduce(
				( acc: Record< string, ShoppingCartItem[] >, item ) => (
					( acc[ item.slug ] = ( acc[ item.slug ] || [] ).concat( item ) ), acc
				),
				{}
			)
		)
			.map( ( group ) => group.sort( ( a, b ) => a.quantity - b.quantity ) )
			.flat();
	}, [ selectedCartItems ] );

	return (
		<>
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
									/* FIXME: redirect to checkout page */
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
			{ showReviewLicenses && (
				<ReviewLicenses
					onClose={ onDismissReviewLicensesModal }
					selectedLicenses={ getGroupedLicenses() }
					selectedSite={ selectedSite }
					isFormReady={ isReady }
					submitForm={ submitForm }
				/>
			) }
		</>
	);
}
