import {
	getCouponLineItemFromCart,
	getCreditsLineItemFromCart,
	NonProductLineItem,
	LineItem,
} from '@automattic/wpcom-checkout';
import styled from '@emotion/styled';
import type { Theme } from '@automattic/composite-checkout';
import type {
	ResponseCart,
	RemoveProductFromCart,
	ResponseCartProduct,
	RemoveCouponFromCart,
} from '@automattic/shopping-cart';

const MiniCartLineItemsWrapper = styled.ul< { theme?: Theme } >`
	border-top: 1px solid ${ ( props ) => props.theme.colors.borderColorLight };
	box-sizing: border-box;
	margin: 20px 0;
	padding: 0;
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
} ): JSX.Element {
	const creditsLineItem = getCreditsLineItemFromCart( responseCart );
	const couponLineItem = getCouponLineItemFromCart( responseCart );

	return (
		<MiniCartLineItemsWrapper>
			{ responseCart.products.map( ( product ) => {
				return (
					<MiniCartLineItemWrapper key={ product.uuid }>
						<LineItem
							product={ product }
							hasDeleteButton={ canItemBeDeleted( product ) }
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
					/>
				</MiniCartLineItemWrapper>
			) }
			{ creditsLineItem && responseCart.sub_total_integer > 0 && (
				<NonProductLineItem subtotal lineItem={ creditsLineItem } />
			) }
		</MiniCartLineItemsWrapper>
	);
}

function canItemBeDeleted( item: ResponseCartProduct ): boolean {
	const itemTypesThatCannotBeDeleted = [ 'domain_redemption' ];
	return ! itemTypesThatCannotBeDeleted.includes( item.product_slug );
}
