import { useShoppingCart } from '@automattic/shopping-cart';
import { getCouponLineItemFromCart, getCreditsLineItemFromCart } from '@automattic/wpcom-checkout';
import styled from '@emotion/styled';
import PropTypes from 'prop-types';
import * as React from 'react';
import useCartKey from 'calypso/my-sites/checkout/use-cart-key';
import joinClasses from './join-classes';
import { NonProductLineItem, LineItem } from './wp-line-item';
import type { OnChangeItemVariant } from './item-variation-picker';
import type { Theme } from '@automattic/composite-checkout';
import type {
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
}: {
	className?: string;
	siteId?: number | undefined;
	isSummary?: boolean;
	removeProductFromCart?: RemoveProductFromCart;
	removeCoupon: RemoveCouponFromCart;
	onChangePlanLength?: OnChangeItemVariant;
	createUserAndSiteBeforeTransaction?: boolean;
} ): JSX.Element {
	const cartKey = useCartKey();
	const { responseCart } = useShoppingCart( cartKey );
	const creditsLineItem = getCreditsLineItemFromCart( responseCart );
	const couponLineItem = getCouponLineItemFromCart( responseCart );

	return (
		<WPOrderReviewList className={ joinClasses( [ className, 'order-review-line-items' ] ) }>
			{ responseCart.products.map( ( product ) => {
				return (
					<WPOrderReviewListItem key={ product.uuid }>
						<LineItem
							product={ product }
							allowVariants
							siteId={ siteId }
							hasDeleteButton={ canItemBeDeleted( product ) }
							removeProductFromCart={ removeProductFromCart }
							onChangePlanLength={ onChangePlanLength }
							isSummary={ isSummary }
							createUserAndSiteBeforeTransaction={ createUserAndSiteBeforeTransaction }
						/>
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
					/>
				</WPOrderReviewListItem>
			) }
			{ creditsLineItem && responseCart.sub_total_integer > 0 && (
				<NonProductLineItem subtotal lineItem={ creditsLineItem } isSummary={ isSummary } />
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
