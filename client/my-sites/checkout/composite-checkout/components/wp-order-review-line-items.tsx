import { isJetpackPurchasableItem, isPremium } from '@automattic/calypso-products';
import { FormStatus, useFormStatus } from '@automattic/composite-checkout';
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
import { hasDIFMProduct } from 'calypso/lib/cart-values/cart-items';
import { useExperiment } from 'calypso/lib/explat';
import { isWcMobileApp } from 'calypso/lib/mobile-app';
import {
	getVariantPlanProductSlugs,
	useGetProductVariants,
} from 'calypso/my-sites/checkout/composite-checkout/hooks/product-variants';
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

const WPOrderReviewList = styled.ul< { theme?: Theme } >`
	border-top: 1px solid ${ ( props ) => props.theme.colors.borderColorLight };
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
	onChangePlanLength,
	createUserAndSiteBeforeTransaction,
	responseCart,
	isPwpoUser,
	onRemoveProduct,
	onRemoveProductClick,
	onRemoveProductCancel,
	forceRadioButtons,
}: {
	className?: string;
	isSummary?: boolean;
	removeProductFromCart?: RemoveProductFromCart;
	removeCoupon: RemoveCouponFromCart;
	onChangePlanLength?: OnChangeItemVariant;
	createUserAndSiteBeforeTransaction?: boolean;
	responseCart: ResponseCart;
	isPwpoUser: boolean;
	onRemoveProduct?: ( label: string ) => void;
	onRemoveProductClick?: ( label: string ) => void;
	onRemoveProductCancel?: ( label: string ) => void;
	// TODO: This is just for unit tests. Remove forceRadioButtons everywhere
	// when calypso_checkout_variant_picker_radio_2212 ExPlat test completes.
	forceRadioButtons?: boolean;
} ) {
	const creditsLineItem = getCreditsLineItemFromCart( responseCart );
	const couponLineItem = getCouponLineItemFromCart( responseCart );
	const { formStatus } = useFormStatus();
	const isDisabled = formStatus !== FormStatus.READY;
	const hasPartnerCoupon = getPartnerCoupon( {
		coupon: responseCart.coupon,
		products: responseCart.products,
	} );

	const [ initialProducts ] = useState( () => responseCart.products );

	return (
		<WPOrderReviewList className={ joinClasses( [ className, 'order-review-line-items' ] ) }>
			{ responseCart.products.map( ( product ) => (
				<LineItemWrapper
					forceRadioButtons={ forceRadioButtons }
					key={ product.product_slug }
					product={ product }
					isSummary={ isSummary }
					removeProductFromCart={ removeProductFromCart }
					onChangePlanLength={ onChangePlanLength }
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
							const variants = getVariantPlanProductSlugs( initialProduct.product_slug );
							return variants.includes( product.product_slug );
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
			{ creditsLineItem && responseCart.sub_total_integer > 0 && (
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
	onChangePlanLength,
	createUserAndSiteBeforeTransaction,
	responseCart,
	isPwpoUser,
	onRemoveProduct,
	onRemoveProductClick,
	onRemoveProductCancel,
	hasPartnerCoupon,
	isDisabled,
	initialVariantTerm,
	forceRadioButtons,
}: {
	product: ResponseCartProduct;
	isSummary?: boolean;
	removeProductFromCart?: RemoveProductFromCart;
	onChangePlanLength?: OnChangeItemVariant;
	createUserAndSiteBeforeTransaction?: boolean;
	responseCart: ResponseCart;
	isPwpoUser: boolean;
	onRemoveProduct?: ( label: string ) => void;
	onRemoveProductClick?: ( label: string ) => void;
	onRemoveProductCancel?: ( label: string ) => void;
	hasPartnerCoupon: boolean;
	isDisabled: boolean;
	initialVariantTerm: number | null | undefined;
	// TODO: This is just for unit tests. Remove forceRadioButtons everywhere
	// when calypso_checkout_variant_picker_radio_2212 ExPlat test completes.
	forceRadioButtons?: boolean;
} ) {
	const isRenewal = isWpComProductRenewal( product );
	const isWooMobile = isWcMobileApp();
	const isDeletable = canItemBeRemovedFromCart( product, responseCart ) && ! isWooMobile;

	const shouldShowVariantSelector =
		onChangePlanLength &&
		! isWooMobile &&
		! isRenewal &&
		! isPremiumPlanWithDIFMInTheCart( product, responseCart ) &&
		! hasPartnerCoupon;
	const isJetpack = responseCart.products.some( ( product ) =>
		isJetpackPurchasableItem( product.product_slug )
	);

	const variants = useGetProductVariants( product, ( variant ) => {
		// Only show term variants which are equal to or longer than the variant that
		// was in the cart when checkout finished loading (not necessarily the
		// current variant). For WordPress.com only, not Jetpack. See
		// https://github.com/Automattic/wp-calypso/issues/69633
		if ( ! initialVariantTerm ) {
			return true;
		}
		if ( isJetpack ) {
			return true;
		}
		return variant.termIntervalInMonths >= initialVariantTerm;
	} );

	const areThereVariants = variants.length > 1;
	const [ isLoadingExperimentAssignment, experimentAssignment ] = useExperiment(
		'calypso_checkout_variant_picker_radio_2212',
		{
			isEligible: areThereVariants && shouldShowVariantSelector && ! isJetpack,
		}
	);
	const shouldUseRadioButtons =
		forceRadioButtons || ( ! isJetpack && experimentAssignment?.variationName === 'treatment' );

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
				{ ( ! isLoadingExperimentAssignment || forceRadioButtons ) &&
					areThereVariants &&
					shouldShowVariantSelector && (
						<ItemVariationPicker
							selectedItem={ product }
							onChangeItemVariant={ onChangePlanLength }
							isDisabled={ isDisabled }
							variants={ variants }
							type={ shouldUseRadioButtons ? 'radio' : 'dropdown' }
						/>
					) }
			</LineItem>
		</WPOrderReviewListItem>
	);
}

/**
 * Checks if the given item is the premium plan product and the DIFM product exists in the provided shopping cart object
 */
function isPremiumPlanWithDIFMInTheCart( item: ResponseCartProduct, responseCart: ResponseCart ) {
	return isPremium( item ) && hasDIFMProduct( responseCart );
}
