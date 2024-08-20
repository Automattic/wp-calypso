import page from '@automattic/calypso-router';
import { Button } from '@automattic/components';
import { getQueryArg } from '@wordpress/url';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import { useCallback, useMemo, useContext, useEffect } from 'react';
import Layout from 'calypso/a8c-for-agencies/components/layout';
import LayoutBody from 'calypso/a8c-for-agencies/components/layout/body';
import LayoutHeader, {
	LayoutHeaderBreadcrumb as Breadcrumb,
} from 'calypso/a8c-for-agencies/components/layout/header';
import LayoutTop from 'calypso/a8c-for-agencies/components/layout/top';
import MobileSidebarNavigation from 'calypso/a8c-for-agencies/components/sidebar/mobile-sidebar-navigation';
import {
	A4A_MARKETPLACE_LINK,
	A4A_SITES_LINK,
} from 'calypso/a8c-for-agencies/components/sidebar-menu/lib/constants';
import { useDispatch, useSelector } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import getSites from 'calypso/state/selectors/get-sites';
import useFetchClientReferral from '../../client/hooks/use-fetch-client-referral';
import { MarketplaceTypeContext } from '../context';
import withMarketplaceType, { MARKETPLACE_TYPE_REFERRAL } from '../hoc/with-marketplace-type';
import useProductsById from '../hooks/use-products-by-id';
import useProductsBySlug from '../hooks/use-products-by-slug';
import useShoppingCart from '../hooks/use-shopping-cart';
import useReferralDevSite from '../hosting-overview/hooks/use-referral-dev-site';
import { getClientReferralQueryArgs } from '../lib/get-client-referral-query-args';
import useSubmitForm from '../products-overview/product-listing/hooks/use-submit-form';
import NoticeSummary from './notice-summary';
import PricingSummary from './pricing-summary';
import ProductInfo from './product-info';
import RequestClientPayment from './request-client-payment';
import SubmitPaymentInfo from './submit-payment-info';
import type { ShoppingCartItem } from '../types';

import './style.scss';

interface Props {
	isClient?: boolean;
	referralBlogId?: number;
}

function Checkout( { isClient, referralBlogId }: Props ) {
	const translate = useTranslate();
	const dispatch = useDispatch();

	const { marketplaceType } = useContext( MarketplaceTypeContext );
	const isAutomatedReferrals = marketplaceType === MARKETPLACE_TYPE_REFERRAL;

	const { selectedCartItems, onRemoveCartItem, onClearCart, setSelectedCartItems } =
		useShoppingCart();

	// Fetch selected products by slug for site checkout
	const { selectedProductsBySlug } = useProductsBySlug();

	// Fetch client referral items if it's a client referral checkout
	const { data: clientCheckoutItems } = useFetchClientReferral( getClientReferralQueryArgs() );

	// Get referred products for client referral checkout only if it's a client referral checkout
	const { referredProducts } = useProductsById( clientCheckoutItems?.products ?? [], isClient );

	// Get sites and selected site
	const sites = useSelector( getSites );
	const siteId = getQueryArg( window.location.href, 'site_id' )?.toString();
	const selectedSite =
		siteId && sites ? sites.find( ( site ) => site?.ID === parseInt( siteId ) ) : null;

	const { isReady, submitForm } = useSubmitForm( {
		selectedSite,
		onSuccessCallback: onClearCart,
	} );

	const sortedSelectedItems = useMemo( () => {
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

	// Use selected products by slug for site checkout
	let checkoutItems = siteId ? selectedProductsBySlug : sortedSelectedItems;

	// Use referred products for client referral checkout
	if ( isClient ) {
		checkoutItems = referredProducts;
	}

	const onCheckout = useCallback( () => {
		submitForm( checkoutItems );
		dispatch(
			recordTracksEvent( 'calypso_a4a_marketplace_checkout_checkout_click', {
				total_licenses: checkoutItems.length,
				items: checkoutItems?.map( ( item ) => `${ item.slug } x ${ item.quantity }` ).join( ',' ),
			} )
		);
	}, [ dispatch, checkoutItems, submitForm ] );

	const onEmptyCart = useCallback( () => {
		dispatch( recordTracksEvent( 'calypso_a4a_marketplace_checkout_empty_cart_click' ) );
		onClearCart();
		page( A4A_MARKETPLACE_LINK );
	}, [ dispatch, onClearCart ] );

	const onContinueShopping = useCallback( () => {
		dispatch( recordTracksEvent( 'calypso_a4a_marketplace_checkout_continue_shopping_click' ) );
		page( A4A_MARKETPLACE_LINK );
	}, [ dispatch ] );

	const onRemoveItem = useCallback(
		( item: ShoppingCartItem ) => {
			dispatch( recordTracksEvent( 'calypso_a4a_marketplace_checkout_remove_item_click' ) );
			onRemoveCartItem( item );
		},
		[ dispatch, onRemoveCartItem ]
	);

	const cancelPurchase = useCallback( () => {
		dispatch( recordTracksEvent( 'calypso_a4a_marketplace_checkout_cancel_purchase_click' ) );
		page( A4A_SITES_LINK );
	}, [ dispatch ] );

	const { addReferralPlanToCart, isLoading: isLoadingReferralDevSite } = useReferralDevSite(
		setSelectedCartItems,
		referralBlogId
	);

	useEffect( () => {
		// When the referralBlogId is present, add the referral plan to the cart.
		if ( referralBlogId && ! isLoadingReferralDevSite ) {
			addReferralPlanToCart();
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [ referralBlogId && isLoadingReferralDevSite ] );

	const title = isAutomatedReferrals ? translate( 'Referral checkout' ) : translate( 'Checkout' );

	let actionContent = (
		<>
			<NoticeSummary type="agency-purchase" />

			<div className="checkout__aside-actions">
				<Button
					primary
					onClick={ onCheckout }
					disabled={ ! checkoutItems.length || ! isReady }
					busy={ ! isReady }
				>
					{ translate( 'Purchase' ) }
				</Button>

				{ siteId ? (
					<Button onClick={ cancelPurchase }>{ translate( 'Cancel' ) }</Button>
				) : (
					<>
						<Button onClick={ onContinueShopping }>{ translate( 'Continue shopping' ) }</Button>

						<Button borderless onClick={ onEmptyCart }>
							{ translate( 'Empty cart' ) }
						</Button>
					</>
				) }
			</div>
		</>
	);

	if ( isAutomatedReferrals ) {
		actionContent = <RequestClientPayment checkoutItems={ checkoutItems } />;
	}

	if ( isClient ) {
		actionContent = <SubmitPaymentInfo disableButton={ checkoutItems?.length === 0 } />;
	}

	return (
		<Layout
			className="checkout"
			title={ title }
			wide
			withBorder={ ! isClient }
			compact
			sidebarNavigation={ ! isClient && <MobileSidebarNavigation /> }
		>
			{ isClient ? null : (
				<LayoutTop>
					<LayoutHeader>
						<Breadcrumb
							items={ [
								{
									label: translate( 'Marketplace' ),
									href: A4A_MARKETPLACE_LINK,
								},
								{
									label: title,
								},
							] }
						/>
					</LayoutHeader>
				</LayoutTop>
			) }
			<LayoutBody>
				<div className="checkout__container">
					<div className="checkout__main">
						<h1 className="checkout__main-title">{ title }</h1>

						<div className="checkout__main-list">
							{ checkoutItems.map( ( items ) => (
								<ProductInfo
									key={ `product-info-${ items.product_id }-${ items.quantity }` }
									product={ items }
								/>
							) ) }
						</div>
					</div>
					<div
						className={ clsx( 'checkout__aside', {
							'checkout__aside--referral': isAutomatedReferrals,
							'checkout__aside--client': isClient,
						} ) }
					>
						<PricingSummary
							items={ checkoutItems }
							onRemoveItem={ siteId || isClient ? undefined : onRemoveItem }
							isAutomatedReferrals={ isAutomatedReferrals }
							isClient={ isClient }
						/>

						{ actionContent }
					</div>
				</div>
			</LayoutBody>
		</Layout>
	);
}

export default withMarketplaceType( Checkout );
