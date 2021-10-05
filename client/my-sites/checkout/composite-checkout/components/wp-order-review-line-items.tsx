import { FormStatus, useFormStatus } from '@automattic/composite-checkout';
import {
	getCouponLineItemFromCart,
	getCreditsLineItemFromCart,
	isWpComProductRenewal,
	joinClasses,
	NonProductLineItem,
	LineItem,
} from '@automattic/wpcom-checkout';
import styled from '@emotion/styled';
import PropTypes from 'prop-types';
import * as React from 'react';
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
} ): JSX.Element {
	const creditsLineItem = getCreditsLineItemFromCart( responseCart );
	const couponLineItem = getCouponLineItemFromCart( responseCart );
	const { formStatus } = useFormStatus();
	const isDisabled = formStatus !== FormStatus.READY;

	return (
		<WPOrderReviewList className={ joinClasses( [ className, 'order-review-line-items' ] ) }>
			{ responseCart.products.map( ( product ) => {
				const isRenewal = isWpComProductRenewal( product );
				const shouldShowVariantSelector = onChangePlanLength && ! isRenewal;
				return (
					<WPOrderReviewListItem key={ product.uuid }>
						<LineItem
							product={ product }
							hasDeleteButton={ canItemBeDeleted( product ) }
							removeProductFromCart={ removeProductFromCart }
							isSummary={ isSummary }
							createUserAndSiteBeforeTransaction={ createUserAndSiteBeforeTransaction }
							responseCart={ responseCart }
							isPwpoUser={ isPwpoUser }
						>
							{ shouldShowVariantSelector && (
								<ItemVariationPicker
									selectedItem={ product }
									onChangeItemVariant={ onChangePlanLength }
									isDisabled={ isDisabled }
									siteId={ siteId }
									productSlug={ product.product_slug }
								/>
							) }
						</LineItem>
					</WPOrderReviewListItem>
				);
			} ) }
			{ couponLineItem && (
				<WPOrderReviewListItem key={ couponLineItem.id }>
					<NonProductLineItem
						lineItem={ couponLineItem }
						isSummary={ isSummary }
						hasDeleteButton={ ! isSummary }
						removeProductFromCart={ removeCoupon }
						createUserAndSiteBeforeTransaction={ createUserAndSiteBeforeTransaction }
						isPwpoUser={ isPwpoUser }
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

function canItemBeDeleted( item: ResponseCartProduct ): boolean {
	const itemTypesThatCannotBeDeleted = [ 'domain_redemption' ];
	return ! itemTypesThatCannotBeDeleted.includes( item.product_slug );
}
