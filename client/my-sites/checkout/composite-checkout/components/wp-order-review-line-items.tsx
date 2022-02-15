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
import PropTypes from 'prop-types';
import * as React from 'react';
import { hasDIFMProduct } from 'calypso/lib/cart-values/cart-items';
import { ItemVariationPicker } from './item-variation-picker';
import type { OnChangeItemVariant } from './item-variation-picker';
import type { Theme } from '@automattic/composite-checkout';
import type {
	ResponseCart,
	RemoveProductFromCart,
	ResponseCartProduct,
	RemoveCouponFromCart,
} from '@automattic/shopping-cart';

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
}: {
	children: React.ReactNode;
	className?: string;
} ): JSX.Element {
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
} ): JSX.Element {
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
			{ responseCart.products.map( ( product ) => {
				const isRenewal = isWpComProductRenewal( product );
				const shouldShowVariantSelector =
					onChangePlanLength &&
					! isRenewal &&
					! isPremiumPlanWithDIFMInTheCart( product, responseCart ) &&
					! hasPartnerCoupon;
				return (
					<WPOrderReviewListItem key={ product.uuid }>
						<LineItem
							product={ product }
							hasDeleteButton={ canItemBeRemovedFromCart( product, responseCart ) }
							removeProductFromCart={ removeProductFromCart }
							isSummary={ isSummary }
							createUserAndSiteBeforeTransaction={ createUserAndSiteBeforeTransaction }
							responseCart={ responseCart }
							isPwpoUser={ isPwpoUser }
							onRemoveProduct={ onRemoveProduct }
							onRemoveProductClick={ onRemoveProductClick }
							onRemoveProductCancel={ onRemoveProductCancel }
						>
							{ shouldShowVariantSelector && (
								<ItemVariationPicker
									selectedItem={ product }
									onChangeItemVariant={ onChangePlanLength }
									isDisabled={ isDisabled }
									siteId={ siteId }
									productSlug={ product.product_slug }
									type="dropdown"
								/>
							) }
						</LineItem>
					</WPOrderReviewListItem>
				);
			} ) }
			{ couponLineItem && (
				<WPOrderReviewListItem key={ couponLineItem.id }>
					<CouponLineItem
						lineItem={ couponLineItem }
						isSummary={ isSummary }
						hasDeleteButton={ ! isSummary }
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

WPOrderReviewLineItems.propTypes = {
	className: PropTypes.string,
	siteId: PropTypes.number,
	isSummary: PropTypes.bool,
	removeProductFromCart: PropTypes.func,
	removeCoupon: PropTypes.func,
	onChangePlanLength: PropTypes.func,
	createUserAndSiteBeforeTransaction: PropTypes.bool,
};

/**
 * Checks if the given item is the premium plan product and the DIFM product exists in the provided shopping cart object
 */
function isPremiumPlanWithDIFMInTheCart( item: ResponseCartProduct, responseCart: ResponseCart ) {
	return isPremium( item ) && hasDIFMProduct( responseCart );
}
