import { useShoppingCart } from '@automattic/shopping-cart';
import {
	getTotalLineItemFromCart,
	getTaxBreakdownLineItemsFromCart,
	getCreditsLineItemFromCart,
	getSubtotalLineItemFromCart,
	NonProductLineItem,
	hasCheckoutVersion,
} from '@automattic/wpcom-checkout';
import styled from '@emotion/styled';
import useCartKey from 'calypso/my-sites/checkout/use-cart-key';
import { WPOrderReviewSection } from './wp-order-review-line-items';

const NonTotalPrices = styled.div`
	font-size: 12px;
	border-top: ${ ( props ) => '1px solid ' + props.theme.colors.borderColorLight };
	border-bottom: ${ ( props ) => '1px solid ' + props.theme.colors.borderColorLight };
	padding: 16px 0;
`;
const TotalPrice = styled.div`
	font-size: 14px;
	padding: 16px 0;
`;

export default function PaymentMethodStep() {
	const cartKey = useCartKey();
	const { responseCart } = useShoppingCart( cartKey );
	const taxLineItems = getTaxBreakdownLineItemsFromCart( responseCart );
	const creditsLineItem = getCreditsLineItemFromCart( responseCart );
	return (
		<>
			{ ! hasCheckoutVersion( '2' ) && (
				<WPOrderReviewSection>
					<NonTotalPrices>
						<NonProductLineItem subtotal lineItem={ getSubtotalLineItemFromCart( responseCart ) } />
						{ taxLineItems.map( ( taxLineItem ) => (
							<NonProductLineItem key={ taxLineItem.id } tax lineItem={ taxLineItem } />
						) ) }
						{ creditsLineItem && responseCart.sub_total_integer > 0 && (
							<NonProductLineItem subtotal lineItem={ creditsLineItem } />
						) }
					</NonTotalPrices>
					<TotalPrice>
						<NonProductLineItem total lineItem={ getTotalLineItemFromCart( responseCart ) } />
					</TotalPrice>
				</WPOrderReviewSection>
			) }
		</>
	);
}
