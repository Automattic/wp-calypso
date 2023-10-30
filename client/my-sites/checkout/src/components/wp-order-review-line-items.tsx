import { isAkismetProduct, isJetpackPurchasableItem } from '@automattic/calypso-products';
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
} from '@automattic/wpcom-checkout';
import styled from '@emotion/styled';
import { useState } from 'react';
import { has100YearPlan } from 'calypso/lib/cart-values/cart-items';
import { isWcMobileApp } from 'calypso/lib/mobile-app';
import { useGetProductVariants } from 'calypso/my-sites/checkout/src/hooks/product-variants';
import { getSignupCompleteFlowName } from 'calypso/signup/storageUtils';
import { ItemVariationPicker } from './item-variation-picker';
import type { OnChangeItemVariant } from './item-variation-picker';
import type { Theme } from '@automattic/composite-checkout';
import type {
	ResponseCart,
	RemoveProductFromCart,
	ResponseCartProduct,
	RemoveCouponFromCart,
} from '@automattic/shopping-cart';
import type { PropsWithChildren } from 'react';

// A/B testing for checkout version 2
const urlParams = new URLSearchParams( window.location.search );
const checkoutVersion = urlParams.get( 'checkoutVersion' );

const WPOrderReviewList = styled.ul< { theme?: Theme } >`
	box-sizing: border-box;
	margin: 20px 0;
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
	removeCoupon: RemoveCouponFromCart;
	onChangeSelection?: OnChangeItemVariant;
	createUserAndSiteBeforeTransaction?: boolean;
	responseCart: ResponseCart;
	isPwpoUser: boolean;
	onRemoveProduct?: ( label: string ) => void;
	onRemoveProductClick?: ( label: string ) => void;
	onRemoveProductCancel?: ( label: string ) => void;
} ) {
	const creditsLineItem = getCreditsLineItemFromCart( responseCart );
	const couponLineItem = getCouponLineItemFromCart( responseCart );
	const { formStatus } = useFormStatus();
	const isDisabled = formStatus !== FormStatus.READY;
	const hasPartnerCoupon = getPartnerCoupon( {
		coupon: responseCart.coupon,
	} );

	const [ initialProducts ] = useState( () => responseCart.products );

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
				/>
			) ) }
			{ couponLineItem && (
				<WPOrderReviewListItem key={ couponLineItem.id }>
					<CouponLineItem
						lineItem={ couponLineItem }
						isSummary={ isSummary }
						hasDeleteButton
						removeProductFromCart={ removeCoupon }
						createUserAndSiteBeforeTransaction={ createUserAndSiteBeforeTransaction }
						isPwpoUser={ isPwpoUser }
						hasPartnerCoupon={ hasPartnerCoupon }
					/>
				</WPOrderReviewListItem>
			) }
			{ checkoutVersion !== '2' && creditsLineItem && responseCart.sub_total_integer > 0 && (
				<NonProductLineItem
					subtotal
					lineItem={ creditsLineItem }
					isSummary={ isSummary }
					isPwpoUser={ isPwpoUser }
				/>
			) }
		</WPOrderReviewList>
	);
}

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
} ) {
	const isRenewal = isWpComProductRenewal( product );
	const isWooMobile = isWcMobileApp();
	let isDeletable = canItemBeRemovedFromCart( product, responseCart ) && ! isWooMobile;
	const has100YearPlanProduct = has100YearPlan( responseCart );

	const signupFlowName = getSignupCompleteFlowName();
	if ( isCopySiteFlow( signupFlowName ) && ! product.is_domain_registration ) {
		isDeletable = false;
	}

	const shouldShowVariantSelector =
		onChangeSelection &&
		! isWooMobile &&
		! isRenewal &&
		! hasPartnerCoupon &&
		! has100YearPlanProduct;

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
			>
				{ areThereVariants && shouldShowVariantSelector && (
					<ItemVariationPicker
						selectedItem={ product }
						onChangeItemVariant={ onChangeSelection }
						isDisabled={ isDisabled }
						variants={ variants }
					/>
				) }
			</LineItem>
		</WPOrderReviewListItem>
	);
}
