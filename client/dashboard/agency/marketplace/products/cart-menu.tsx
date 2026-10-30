import { formatCurrency } from '@automattic/number-formatters';
import {
	Button,
	Dropdown,
	__experimentalHeading as Heading,
	__experimentalHStack as HStack,
	__experimentalNumberControl as NumberControl,
	__experimentalText as Text,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { __, _n, sprintf } from '@wordpress/i18n';
import { cart } from '@wordpress/icons';
import { Fragment, useState } from 'react';
import { useAnalytics } from '../../../app/analytics';
import Divider from '../../../components/divider';
import RouterLinkButton from '../../../components/router-link-button';
import { TextBlur } from '../../../components/text-blur';
import { ApprovalGate, useIsApprovalGated } from '../../approval-gate';
import { useBackHereSearch } from '../../components/fullscreen-page';
import { WPCOM_CREATOR_PLAN_SLUG, WPCOM_HOSTING_FAMILY_SLUG } from '../lib/wpcom-hosting';
import { MARKETPLACE_REFERRAL_CHECKOUT_ROUTE } from '../paths';
import { canHoldLicenses, getLicenseCountText, getMaxLicenses } from './lib/cart-licenses';
import { getCheckoutUrl, getLegacyCheckoutUrl } from './lib/checkout-url';
import { getTermSuffix } from './lib/product-pricing';
import { getProductTitle } from './lib/product-title';
import { useCartLines } from './use-cart-lines';
import type { TermPricing } from '../use-term-pricing';
import type { CartItemRef, ShoppingCartItem } from './use-shopping-cart';
import type { AgencyProduct } from '@automattic/api-core';

import './cart-menu.scss';

interface CartMenuProps {
	items: ShoppingCartItem[];
	products: AgencyProduct[];
	term: TermPricing;
	isReferralMode: boolean;
	isAgencyApproved: boolean;
	/** The agency still bills through the previous system, which this checkout cannot charge. */
	isLegacyBilling?: boolean;
	/** Controls the dropdown, for pages that open the cart after adding to it. */
	open?: boolean;
	onToggle?: ( willOpen: boolean ) => void;
	onRemove: ( item: CartItemRef ) => void;
	/** Sets how many of a product its line holds, from the line's counter. */
	onSetQuantity?: ( item: CartItemRef, quantity: number ) => void;
	onCheckout?: () => void;
}

const getCartProductName = ( product: AgencyProduct ) =>
	product.slug === WPCOM_CREATOR_PLAN_SLUG
		? __( 'WordPress.com Site' )
		: getProductTitle( product.name );

export default function CartMenu( {
	items,
	products,
	term,
	isReferralMode,
	isAgencyApproved,
	isLegacyBilling = false,
	open,
	onToggle,
	onRemove,
	onSetQuantity,
	onCheckout,
}: CartMenuProps ) {
	const { recordTracksEvent } = useAnalytics();
	const backHereSearch = useBackHereSearch();
	const { lines, currency, total, commission, isTotalReady, hasWpcomHostingPlan } = useCartLines( {
		items,
		products,
		term,
		isReferralMode,
	} );
	// Lines with a counter come first; the rest keep their order at the bottom.
	const orderedLines = lines
		.map( ( line ) => ( {
			...line,
			showsCount:
				!! onSetQuantity && canHoldLicenses( line.product, { isReferralMode, isLegacyBilling } ),
		} ) )
		.sort( ( a, b ) => Number( b.showsCount ) - Number( a.showsCount ) );

	const checkoutLines = lines.map( ( { product, item } ) => ( {
		product,
		quantity: item.quantity,
		siteDomain: item.siteDomain,
	} ) );

	const isGated = useIsApprovalGated();
	const [ isGateOpen, setIsGateOpen ] = useState( false );

	const checkoutButtonProps = {
		variant: 'primary' as const,
		__next40pxDefaultSize: true,
		disabled: ( ! isAgencyApproved && ! isGated ) || ! isTotalReady,
		style: { justifyContent: 'center' },
		onClick: () => {
			recordTracksEvent( 'calypso_a4a_marketplace_checkout_click', {
				purchase_mode: isReferralMode ? 'referral' : 'regular',
				term_pricing: term,
			} );
			onCheckout?.();
		},
		children: __( 'Checkout' ),
	};
	let checkoutButton = isReferralMode ? (
		<RouterLinkButton
			{ ...checkoutButtonProps }
			to={ MARKETPLACE_REFERRAL_CHECKOUT_ROUTE }
			search={ backHereSearch }
		/>
	) : (
		<Button
			{ ...checkoutButtonProps }
			href={
				isLegacyBilling
					? getLegacyCheckoutUrl( checkoutLines )
					: getCheckoutUrl( checkoutLines, { term, hasWpcomHostingPlan } )
			}
		/>
	);
	if ( isGated ) {
		checkoutButton = (
			<Button
				{ ...checkoutButtonProps }
				onClick={ () => {
					onToggle?.( false );
					setIsGateOpen( true );
				} }
			/>
		);
	}

	return (
		<>
			{ isGateOpen && <ApprovalGate kind="purchase" onClose={ () => setIsGateOpen( false ) } /> }
			<Dropdown
				className="dashboard-marketplace-products__cart-menu"
				open={ open }
				onToggle={ onToggle }
				popoverProps={ { placement: 'bottom-end' } }
				// Focuses the panel, not its first Remove button, which Enter would trigger.
				focusOnMount
				expandOnMobile
				renderToggle={ ( { isOpen, onToggle } ) => (
					<Button
						icon={ cart }
						label={
							items.length > 0
								? sprintf(
										/* translators: %d is the number of items in the cart. */
										_n( 'Shopping cart, %d item', 'Shopping cart, %d items', items.length ),
										items.length
									)
								: __( 'Shopping cart' )
						}
						aria-expanded={ isOpen }
						text={ items.length > 0 ? String( items.length ) : undefined }
						onClick={ () => {
							recordTracksEvent( 'calypso_a4a_marketplace_toggle_cart', {
								purchase_mode: isReferralMode ? 'referral' : 'regular',
								term_pricing: term,
							} );
							onToggle();
						} }
					/>
				) }
				renderContent={ () => (
					<VStack spacing={ 3 } className="dashboard-marketplace-products__cart">
						<Heading level={ 3 } size={ 13 }>
							{ __( 'Your cart' ) }
						</Heading>
						{ lines.length === 0 && <Text variant="muted">{ __( 'Your cart is empty.' ) }</Text> }
						{ orderedLines.map( ( { item, product, priceInfo, subtotal, showsCount }, index ) => {
							const isWpcomPlan = product.family_slug === WPCOM_HOSTING_FAMILY_SLUG;
							const maxQuantity = getMaxLicenses( product );
							return (
								<Fragment key={ `${ item.slug }:${ item.siteDomain ?? '' }` }>
									{ index > 0 && (
										<Divider style={ { color: 'var(--dashboard-overview__divider-color)' } } />
									) }
									<HStack justify="space-between" spacing={ 4 } alignment="flex-start">
										<VStack spacing={ 0 }>
											<Text>
												{ item.quantity > 1 && ! showsCount
													? sprintf(
															/* translators: %1$s is the product name, %2$d the quantity. */
															__( '%1$s x %2$d' ),
															getCartProductName( product ),
															item.quantity
														)
													: getCartProductName( product ) }
											</Text>
											{ item.siteDomain && (
												<Text variant="muted" size={ 12 }>
													{ item.siteDomain }
												</Text>
											) }
											{ /* The spans keep Google Translate from crashing on sibling text nodes. */ }
											<Text variant="muted" size={ 12 }>
												<TextBlur
													isBlurred={
														! isTotalReady && product.family_slug === WPCOM_HOSTING_FAMILY_SLUG
													}
												>
													{ priceInfo.isFree
														? __( 'Free' )
														: formatCurrency( subtotal, currency ) + getTermSuffix( term ) }
												</TextBlur>
												{ priceInfo.regularPrice !== undefined && (
													<span>
														{ ' ' }
														<s>
															{ formatCurrency( priceInfo.regularPrice * item.quantity, currency ) }
														</s>
													</span>
												) }
												{ ! priceInfo.isFree && priceInfo.billingTerm !== term && (
													<span>
														{ ' ' +
															( priceInfo.billingTerm === 'yearly'
																? __( '(billed yearly)' )
																: __( '(billed monthly)' ) ) }
													</span>
												) }
											</Text>
											{ showsCount && ! priceInfo.isFree && item.quantity > 1 && (
												<Text variant="muted" size={ 12 }>
													{ isWpcomPlan ? (
														// A site's price falls with the volume tier, so it comes from the line's total.
														<TextBlur isBlurred={ ! isTotalReady }>
															{ getLicenseCountText( {
																quantity: item.quantity,
																unitPrice:
																	formatCurrency( subtotal / item.quantity, currency ) +
																	getTermSuffix( term ),
																isSite: true,
															} ) }
														</TextBlur>
													) : (
														getLicenseCountText( {
															quantity: item.quantity,
															unitPrice:
																formatCurrency( priceInfo.price, currency ) + getTermSuffix( term ),
															isSite: false,
														} )
													) }
												</Text>
											) }
										</VStack>
										<VStack spacing={ 2 } alignment="flex-end" expanded={ false }>
											{ showsCount && (
												<div className="dashboard-marketplace-products__cart-count">
													<NumberControl
														__next40pxDefaultSize
														size="compact"
														label={
															isWpcomPlan
																? __( 'Number of sites' )
																: sprintf(
																		/* translators: %s is the product name. */
																		__( 'Licenses of %s' ),
																		getCartProductName( product )
																	)
														}
														hideLabelFromVision
														min={ 1 }
														max={ maxQuantity }
														spinControls="custom"
														value={ String( item.quantity ) }
														onChange={ ( value ) => {
															const quantity = parseInt( String( value ), 10 );
															// An emptied field is still being typed in; Remove takes the line out.
															if ( ! Number.isNaN( quantity ) ) {
																const licenses = Math.min( maxQuantity, Math.max( 1, quantity ) );
																recordTracksEvent(
																	'calypso_a4a_marketplace_checkout_set_item_quantity',
																	{ product: item.slug, quantity: licenses }
																);
																onSetQuantity?.( item, licenses );
															}
														} }
													/>
												</div>
											) }
											<Button
												variant="link"
												isDestructive
												aria-label={
													item.siteDomain
														? sprintf(
																/* translators: %1$s is the product name, %2$s the site the add-on applies to. */
																__( 'Remove %1$s for %2$s from the cart' ),
																getCartProductName( product ),
																item.siteDomain
															)
														: sprintf(
																/* translators: %s is the product name. */
																__( 'Remove %s from the cart' ),
																getCartProductName( product )
															)
												}
												onClick={ () => {
													recordTracksEvent( 'calypso_a4a_marketplace_checkout_remove_item_click', {
														product: item.slug,
													} );
													onRemove( item );
												} }
											>
												{ __( 'Remove' ) }
											</Button>
										</VStack>
									</HStack>
								</Fragment>
							);
						} ) }
						{ lines.length > 0 && (
							<>
								<HStack justify="space-between">
									<Text weight={ 600 }>
										{ isReferralMode ? __( 'Total your client will pay:' ) : __( 'Total:' ) }
									</Text>
									<Text weight={ 600 }>
										<TextBlur isBlurred={ ! isTotalReady }>
											{ formatCurrency( total, currency ) + getTermSuffix( term ) }
										</TextBlur>
									</Text>
								</HStack>
								{ isReferralMode && commission > 0 && (
									<HStack justify="space-between">
										<Text variant="muted">{ __( 'Your estimated commission:' ) }</Text>
										<Text variant="muted">
											<TextBlur isBlurred={ ! isTotalReady }>
												{ formatCurrency( commission, currency ) + getTermSuffix( term ) }
											</TextBlur>
										</Text>
									</HStack>
								) }
								{ checkoutButton }
							</>
						) }
					</VStack>
				) }
			/>
		</>
	);
}
