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

const MasterbarCartLineItemsWrapper = styled.ul< { theme?: Theme } >`
	border-top: 1px solid ${ ( props ) => props.theme.colors.borderColorLight };
	box-sizing: border-box;
	margin: 20px 0;
	padding: 0;
`;

const MasterbarCartLineItemWrapper = styled.li`
	margin: 0;
	padding: 0;
	display: block;
	list-style: none;
`;

export function MasterbarCartLineItems( {
	removeProductFromCart,
	removeCoupon,
	createUserAndSiteBeforeTransaction,
	responseCart,
	isPwpoUser,
}: {
	removeProductFromCart: RemoveProductFromCart;
	removeCoupon: RemoveCouponFromCart;
	createUserAndSiteBeforeTransaction?: boolean;
	responseCart: ResponseCart;
	isPwpoUser: boolean;
} ): JSX.Element {
	const creditsLineItem = getCreditsLineItemFromCart( responseCart );
	const couponLineItem = getCouponLineItemFromCart( responseCart );

	return (
		<MasterbarCartLineItemsWrapper>
			{ responseCart.products.map( ( product ) => {
				return (
					<MasterbarCartLineItemWrapper key={ product.uuid }>
						<LineItem
							product={ product }
							hasDeleteButton={ canItemBeDeleted( product ) }
							removeProductFromCart={ removeProductFromCart }
							createUserAndSiteBeforeTransaction={ createUserAndSiteBeforeTransaction }
							responseCart={ responseCart }
							isPwpoUser={ isPwpoUser }
						/>
					</MasterbarCartLineItemWrapper>
				);
			} ) }
			{ couponLineItem && (
				<MasterbarCartLineItemWrapper key={ couponLineItem.id }>
					<NonProductLineItem
						lineItem={ couponLineItem }
						removeProductFromCart={ removeCoupon }
						createUserAndSiteBeforeTransaction={ createUserAndSiteBeforeTransaction }
						isPwpoUser={ isPwpoUser }
					/>
				</MasterbarCartLineItemWrapper>
			) }
			{ creditsLineItem && responseCart.sub_total_integer > 0 && (
				<NonProductLineItem subtotal lineItem={ creditsLineItem } isPwpoUser={ isPwpoUser } />
			) }
		</MasterbarCartLineItemsWrapper>
	);
}

function canItemBeDeleted( item: ResponseCartProduct ): boolean {
	const itemTypesThatCannotBeDeleted = [ 'domain_redemption' ];
	return ! itemTypesThatCannotBeDeleted.includes( item.product_slug );
}
