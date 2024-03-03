import {
	getCouponLineItemFromCart,
	getCreditsLineItemFromCart,
	NonProductLineItem,
	LineItem,
	canItemBeRemovedFromCart,
} from '@automattic/wpcom-checkout';
import styled from '@emotion/styled';
import type { Theme } from '@automattic/composite-checkout';
import type {
	ResponseCart,
	RemoveProductFromCart,
	RemoveCouponFromCart,
} from '@automattic/shopping-cart';

const MiniCartLineItemsWrapper = styled.ul< { theme?: Theme } >`
	border-top: 1px solid ${ ( props ) => props.theme.colors.borderColorLight };
	box-sizing: border-box;
	margin: 20px 0;
	padding: 0;
	overflow-y: auto;
	max-height: 50vh;
	scrollbar-color: var( --color-text, #000 ) var( --color-surface, #fff );
`;

const MiniCartLineItemWrapper = styled.li`
	margin: 0;
	padding: 0;
	display: block;
	list-style: none;
`;

export function MiniCartLineItems( {
	removeProductFromCart,
	removeCoupon,
	createUserAndSiteBeforeTransaction,
	responseCart,
}: {
	removeProductFromCart: RemoveProductFromCart;
	removeCoupon: RemoveCouponFromCart;
	createUserAndSiteBeforeTransaction?: boolean;
	responseCart: ResponseCart;
} ) {
	const creditsLineItem = getCreditsLineItemFromCart( responseCart );
	const couponLineItem = getCouponLineItemFromCart( responseCart );

	return (
		<MiniCartLineItemsWrapper className="mini-cart-line-items">
			{ responseCart.products.map( ( product ) => {
				return (
					<MiniCartLineItemWrapper key={ product.uuid }>
						<LineItem
							product={ product }
							hasDeleteButton={ canItemBeRemovedFromCart( product, responseCart ) }
							removeProductFromCart={ removeProductFromCart }
							createUserAndSiteBeforeTransaction={ createUserAndSiteBeforeTransaction }
							responseCart={ responseCart }
						/>
					</MiniCartLineItemWrapper>
				);
			} ) }
			{ couponLineItem && (
				<MiniCartLineItemWrapper key={ couponLineItem.id }>
					<NonProductLineItem
						lineItem={ couponLineItem }
						removeProductFromCart={ removeCoupon }
						createUserAndSiteBeforeTransaction={ createUserAndSiteBeforeTransaction }
						hasDeleteButton={ couponLineItem.hasDeleteButton }
					/>
				</MiniCartLineItemWrapper>
			) }
			{ creditsLineItem && responseCart.sub_total_integer > 0 && (
				<NonProductLineItem subtotal lineItem={ creditsLineItem } />
			) }
		</MiniCartLineItemsWrapper>
	);
}
