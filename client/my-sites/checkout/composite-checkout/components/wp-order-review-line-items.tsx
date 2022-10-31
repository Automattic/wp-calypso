import { isPremium } from '@automattic/calypso-products';
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
import { hasDIFMProduct } from 'calypso/lib/cart-values/cart-items';
import { isWcMobileApp } from 'calypso/lib/mobile-app';
import { useGetProductVariants } from 'calypso/my-sites/checkout/composite-checkout/hooks/product-variants';
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
	siteId,
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
}: {
	className?: string;
	siteId?: number | undefined;
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
} ) {
	const creditsLineItem = getCreditsLineItemFromCart( responseCart );
	const couponLineItem = getCouponLineItemFromCart( responseCart );
	const { formStatus } = useFormStatus();
	const isDisabled = formStatus !== FormStatus.READY;
	const hasPartnerCoupon = getPartnerCoupon( {
		coupon: responseCart.coupon,
		products: responseCart.products,
	} );

	return (
		<WPOrderReviewList className={ joinClasses( [ className, 'order-review-line-items' ] ) }>
			{ responseCart.products.map( ( product ) => (
				<LineItemWrapper
					key={ product.product_slug }
					product={ product }
					siteId={ siteId }
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
	siteId,
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
}: {
	product: ResponseCartProduct;
	siteId?: number | undefined;
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
	const allVariants = useGetProductVariants( siteId, product.product_slug );
	const currentVariant = allVariants.find(
		( variant ) => variant.productId === product.product_id
	);

	// Only show term variants which are equal to or longer than the currently
	// selected variant. See https://github.com/Automattic/wp-calypso/issues/69633
	const variants = currentVariant
		? allVariants.filter(
				( variant ) => variant.termIntervalInMonths >= currentVariant.termIntervalInMonths
		  )
		: [];

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
						onChangeItemVariant={ onChangePlanLength }
						isDisabled={ isDisabled }
						variants={ variants }
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
