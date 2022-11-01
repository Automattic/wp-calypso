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
import { useSelector } from 'react-redux';
import { hasDIFMProduct } from 'calypso/lib/cart-values/cart-items';
import { isWcMobileApp } from 'calypso/lib/mobile-app';
import {
	useGetProductVariants,
	canVariantBePurchased,
} from 'calypso/my-sites/checkout/composite-checkout/hooks/product-variants';
import { getPlansBySiteId } from 'calypso/state/sites/plans/selectors/get-plans-by-site';
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

	const [ initialVariantTerms ] = useState( () =>
		responseCart.products.map( ( product ) => product.months_per_bill_period )
	);

	return (
		<WPOrderReviewList className={ joinClasses( [ className, 'order-review-line-items' ] ) }>
			{ responseCart.products.map( ( product, i ) => (
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
					initialVariantTerm={ initialVariantTerms[ i ] }
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
	initialVariantTerm,
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
	initialVariantTerm: number | null;
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

	const sitePlans = useSelector( ( state ) => getPlansBySiteId( state, siteId ) );
	const activePlan = sitePlans?.data?.find( ( plan ) => plan.currentPlan );

	const variants = useGetProductVariants( siteId, product.product_slug, ( variant ) => {
		if ( ! canVariantBePurchased( variant, activePlan?.interval ) ) {
			return false;
		}

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
