import config from '@automattic/calypso-config';
import {
	isAkismetProduct,
	isJetpackPurchasableItem,
	AKISMET_PRO_500_PRODUCTS,
} from '@automattic/calypso-products';
import { FormStatus, useFormStatus } from '@automattic/composite-checkout';
import { isCopySiteFlow } from '@automattic/onboarding';
import {
	canItemBeRemovedFromCart,
	getCouponLineItemFromCart,
	getCreditsLineItemFromCart,
	isWpComProductRenewal,
	joinClasses,
	CouponLineItem,
	NonProductLineItem,
	LineItem,
	getPartnerCoupon,
	filterAndGroupCostOverridesForDisplay,
	filterCostOverridesForLineItem,
	hasCheckoutVersion,
} from '@automattic/wpcom-checkout';
import styled from '@emotion/styled';
import { useTranslate } from 'i18n-calypso';
import { useState, useCallback, useMemo } from 'react';
import { has100YearPlan } from 'calypso/lib/cart-values/cart-items';
import { isWcMobileApp } from 'calypso/lib/mobile-app';
import { useGetProductVariants } from 'calypso/my-sites/checkout/src/hooks/product-variants';
import { getSignupCompleteFlowName } from 'calypso/signup/storageUtils';
import { useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { AkismetProQuantityDropDown } from './akismet-pro-quantity-dropdown';
import { CouponCostOverride, LineItemCostOverrides } from './cost-overrides-list';
import { ItemVariationPicker } from './item-variation-picker';
import type { OnChangeAkProQuantity } from './akismet-pro-quantity-dropdown';
import type { OnChangeItemVariant } from './item-variation-picker';
import type {
	ResponseCart,
	RemoveProductFromCart,
	ReplaceProductInCart,
	ResponseCartProduct,
	RemoveCouponFromCart,
} from '@automattic/shopping-cart';
import type { PropsWithChildren } from 'react';

const WPOrderReviewList = styled.ul`
	box-sizing: border-box;
	margin: 24px 0 0 0;
	padding: 0;
`;

const WPOrderReviewListItem = styled.li`
	margin: 0;
	padding: 0;
	display: block;
	list-style: none;
`;

export function WPOrderReviewSection( {
	children,
	className,
}: PropsWithChildren< {
	className?: string;
} > ) {
	return <div className={ joinClasses( [ className, 'order-review-section' ] ) }>{ children }</div>;
}

export function WPOrderReviewLineItems( {
	className,
	isSummary,
	removeProductFromCart,
	replaceProductInCart,
	removeCoupon,
	onChangeSelection,
	createUserAndSiteBeforeTransaction,
	responseCart,
	isPwpoUser,
	onRemoveProduct,
	onRemoveProductClick,
	onRemoveProductCancel,
}: {
	className?: string;
	isSummary?: boolean;
	removeProductFromCart?: RemoveProductFromCart;
	replaceProductInCart: ReplaceProductInCart;
	removeCoupon: RemoveCouponFromCart;
	onChangeSelection?: OnChangeItemVariant;
	createUserAndSiteBeforeTransaction?: boolean;
	responseCart: ResponseCart;
	isPwpoUser: boolean;
	onRemoveProduct?: ( label: string ) => void;
	onRemoveProductClick?: ( label: string ) => void;
	onRemoveProductCancel?: ( label: string ) => void;
} ) {
	const reduxDispatch = useDispatch();
	const translate = useTranslate();
	const creditsLineItem = getCreditsLineItemFromCart( responseCart );
	const couponLineItem = getCouponLineItemFromCart( responseCart );
	const { formStatus } = useFormStatus();
	const isDisabled = formStatus !== FormStatus.READY;
	const hasPartnerCoupon = getPartnerCoupon( {
		coupon: responseCart.coupon,
	} );
	const shouldUseCheckoutV2 = hasCheckoutVersion( '2' );
	const [ initialProducts ] = useState( () => responseCart.products );
	const [ forceShowAkQuantityDropdown, setForceShowAkQuantityDropdown ] = useState( false );

	const isAkismetProMultipleLicensesCart = useMemo( () => {
		if ( ! config.isEnabled( 'akismet/checkout-quantity-dropdown' ) ) {
			return false;
		}
		if ( ! window.location.pathname.startsWith( '/checkout/akismet/' ) ) {
			return false;
		}

		return responseCart.products.every( ( product ) =>
			AKISMET_PRO_500_PRODUCTS.includes(
				product.product_slug as ( typeof AKISMET_PRO_500_PRODUCTS )[ number ]
			)
		);
	}, [ responseCart.products ] );

	const [ variantOpenId, setVariantOpenId ] = useState< string | null >( null );
	const [ akQuantityOpenId, setAkQuantityOpenId ] = useState< string | null >( null );

	const handleVariantToggle = useCallback(
		( id: string | null ) => {
			if ( isAkismetProMultipleLicensesCart ) {
				// Close Akismet quantity dropdown if it's open.
				if ( akQuantityOpenId === id ) {
					setAkQuantityOpenId( null );
				}
			}
			setVariantOpenId( variantOpenId !== id ? id : null );
		},
		[ akQuantityOpenId, isAkismetProMultipleLicensesCart, variantOpenId ]
	);

	const handleAkQuantityToggle = useCallback(
		( id: string | null ) => {
			// Close Variant picker if it's open.
			if ( variantOpenId === id ) {
				setVariantOpenId( null );
			}
			setAkQuantityOpenId( akQuantityOpenId !== id ? id : null );
		},
		[ akQuantityOpenId, variantOpenId ]
	);

	const costOverridesList = filterAndGroupCostOverridesForDisplay( responseCart, translate );

	const changeAkismetPro500CartQuantity = useCallback< OnChangeAkProQuantity >(
		( uuid, productSlug, productId, prevQuantity, newQuantity ) => {
			reduxDispatch(
				recordTracksEvent( 'calypso_checkout_akismet_pro_quantity_change', {
					product_slug: productSlug,
					prev_quantity: prevQuantity,
					new_quantity: newQuantity,
				} )
			);
			replaceProductInCart( uuid, {
				product_slug: productSlug,
				product_id: productId,
				quantity: newQuantity,
			} ).catch( () => {
				// Nothing needs to be done here. CartMessages will display the error to the user.
			} );
		},
		[ replaceProductInCart, reduxDispatch ]
	);

	return (
		<WPOrderReviewList className={ joinClasses( [ className, 'order-review-line-items' ] ) }>
			{ responseCart.products.map( ( product ) => (
				<LineItemWrapper
					key={ product.uuid }
					product={ product }
					isSummary={ isSummary }
					removeProductFromCart={ removeProductFromCart }
					onChangeSelection={ onChangeSelection }
					createUserAndSiteBeforeTransaction={ createUserAndSiteBeforeTransaction }
					responseCart={ responseCart }
					isPwpoUser={ isPwpoUser }
					onRemoveProduct={ onRemoveProduct }
					onRemoveProductClick={ onRemoveProductClick }
					onRemoveProductCancel={ onRemoveProductCancel }
					hasPartnerCoupon={ hasPartnerCoupon }
					isDisabled={ isDisabled }
					initialVariantTerm={
						initialProducts.find( ( initialProduct ) => {
							return initialProduct.product_variants.find(
								( variant ) => variant.product_id === product.product_id
							);
						} )?.months_per_bill_period
					}
					toggleVariantSelector={ handleVariantToggle }
					variantOpenId={ variantOpenId }
					isAkPro500Cart={ isAkismetProMultipleLicensesCart || forceShowAkQuantityDropdown }
					setForceShowAkQuantityDropdown={ setForceShowAkQuantityDropdown }
					onChangeAkProQuantity={ changeAkismetPro500CartQuantity }
					toggleAkQuantityDropdown={ handleAkQuantityToggle }
					akQuantityOpenId={ akQuantityOpenId }
				/>
			) ) }
			{ ! shouldUseCheckoutV2 && couponLineItem && (
				<WPOrderReviewListItem key={ couponLineItem.id }>
					<CouponLineItem
						lineItem={ couponLineItem }
						isSummary={ isSummary }
						hasDeleteButton={ couponLineItem.hasDeleteButton }
						removeProductFromCart={ removeCoupon }
						createUserAndSiteBeforeTransaction={ createUserAndSiteBeforeTransaction }
						isPwpoUser={ isPwpoUser }
						hasPartnerCoupon={ hasPartnerCoupon }
					/>
				</WPOrderReviewListItem>
			) }
			{ ! shouldUseCheckoutV2 && creditsLineItem && responseCart.sub_total_integer > 0 && (
				<NonProductLineItem
					subtotal
					lineItem={ creditsLineItem }
					isSummary={ isSummary }
					isPwpoUser={ isPwpoUser }
					shouldUseCheckoutV2={ shouldUseCheckoutV2 }
				/>
			) }
			{ shouldUseCheckoutV2 && costOverridesList.length > 0 && (
				<CouponCostOverride
					responseCart={ responseCart }
					removeCoupon={ couponLineItem?.hasDeleteButton ? removeCoupon : undefined }
				/>
			) }
		</WPOrderReviewList>
	);
}

const DropdownWrapper = styled.span< {
	shouldUseCheckoutV2?: boolean;
} >`
	${ ( props ) => ( props.shouldUseCheckoutV2 ? `width: 100%; max-width: 200px` : `width: 100%;` ) }
`;

function LineItemWrapper( {
	product,
	isSummary,
	removeProductFromCart,
	onChangeSelection,
	createUserAndSiteBeforeTransaction,
	responseCart,
	isPwpoUser,
	onRemoveProduct,
	onRemoveProductClick,
	onRemoveProductCancel,
	hasPartnerCoupon,
	isDisabled,
	initialVariantTerm,
	toggleVariantSelector,
	variantOpenId,
	isAkPro500Cart,
	setForceShowAkQuantityDropdown,
	onChangeAkProQuantity,
	toggleAkQuantityDropdown,
	akQuantityOpenId,
}: {
	product: ResponseCartProduct;
	isSummary?: boolean;
	removeProductFromCart?: RemoveProductFromCart;
	onChangeSelection?: OnChangeItemVariant;
	createUserAndSiteBeforeTransaction?: boolean;
	responseCart: ResponseCart;
	isPwpoUser: boolean;
	onRemoveProduct?: ( label: string ) => void;
	onRemoveProductClick?: ( label: string ) => void;
	onRemoveProductCancel?: ( label: string ) => void;
	hasPartnerCoupon: boolean;
	isDisabled: boolean;
	initialVariantTerm: number | null | undefined;
	toggleVariantSelector: ( key: string | null ) => void;
	variantOpenId: string | null;
	isAkPro500Cart: boolean;
	setForceShowAkQuantityDropdown: React.Dispatch< React.SetStateAction< boolean > >;
	onChangeAkProQuantity: OnChangeAkProQuantity;
	toggleAkQuantityDropdown: ( key: string | null ) => void;
	akQuantityOpenId: string | null;
} ) {
	const isRenewal = isWpComProductRenewal( product );
	const isWooMobile = isWcMobileApp();
	let isDeletable = canItemBeRemovedFromCart( product, responseCart ) && ! isWooMobile;
	const has100YearPlanProduct = has100YearPlan( responseCart );
	const shouldUseCheckoutV2 = hasCheckoutVersion( '2' );

	const signupFlowName = getSignupCompleteFlowName();
	if ( isCopySiteFlow( signupFlowName ) && ! product.is_domain_registration ) {
		isDeletable = false;
	}

	const shouldShowVariantSelector = ( () => {
		if ( ! onChangeSelection ) {
			return false;
		}
		if ( isWooMobile ) {
			return false;
		}

		if ( isRenewal && ! product.is_domain_registration ) {
			return false;
		}

		if ( hasPartnerCoupon ) {
			return false;
		}

		if ( has100YearPlanProduct ) {
			return false;
		}

		return true;
	} )();

	const isJetpack = responseCart.products.some( ( product ) =>
		isJetpackPurchasableItem( product.product_slug )
	);

	const variants = useGetProductVariants( product, ( variant ) => {
		// Only show term variants which are equal to or longer than the variant that
		// was in the cart when checkout finished loading (not necessarily the
		// current variant). For WordPress.com only, not Jetpack, Akismet or Marketplace.
		// See https://github.com/Automattic/wp-calypso/issues/69633
		if ( ! initialVariantTerm ) {
			return true;
		}
		const isAkismet = isAkismetProduct( { product_slug: variant.productSlug } );
		const isMarketplace = product.extra?.is_marketplace_product;

		if ( isJetpack || isAkismet || isMarketplace ) {
			return true;
		}

		return variant.termIntervalInMonths >= initialVariantTerm;
	} );

	const areThereVariants = variants.length > 1;

	const translate = useTranslate();

	const costOverridesList = filterCostOverridesForLineItem( product, translate );

	const finalShouldShowVariantSelector =
		areThereVariants && shouldShowVariantSelector && onChangeSelection;

	return (
		<WPOrderReviewListItem key={ product.uuid }>
			<LineItem
				product={ product }
				hasDeleteButton={ isDeletable }
				removeProductFromCart={ removeProductFromCart }
				isSummary={ isSummary }
				createUserAndSiteBeforeTransaction={ createUserAndSiteBeforeTransaction }
				responseCart={ responseCart }
				isPwpoUser={ isPwpoUser }
				onRemoveProduct={ onRemoveProduct }
				onRemoveProductClick={ onRemoveProductClick }
				onRemoveProductCancel={ onRemoveProductCancel }
				isAkPro500Cart={ isAkPro500Cart }
				shouldShowBillingInterval={ ! finalShouldShowVariantSelector }
				shouldUseCheckoutV2={ shouldUseCheckoutV2 }
			>
				<DropdownWrapper shouldUseCheckoutV2={ shouldUseCheckoutV2 }>
					{ finalShouldShowVariantSelector && (
						<ItemVariationPicker
							id={ product.uuid }
							selectedItem={ product }
							onChangeItemVariant={ onChangeSelection }
							isDisabled={ isDisabled }
							variants={ variants }
							toggle={ toggleVariantSelector }
							isOpen={ variantOpenId === product.uuid }
						/>
					) }
					{ ! isRenewal && isAkPro500Cart && (
						<AkismetProQuantityDropDown
							id={ product.uuid }
							responseCart={ responseCart }
							setForceShowAkQuantityDropdown={ setForceShowAkQuantityDropdown }
							onChangeAkProQuantity={ onChangeAkProQuantity }
							toggle={ toggleAkQuantityDropdown }
							isOpen={ akQuantityOpenId === product.uuid }
						/>
					) }
				</DropdownWrapper>
				{ shouldUseCheckoutV2 && (
					<LineItemCostOverrides product={ product } costOverridesList={ costOverridesList } />
				) }
			</LineItem>
		</WPOrderReviewListItem>
	);
}
