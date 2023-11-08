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
import CheckoutTerms from '../components/checkout-terms';
import { useShouldCollapseLastStep } from '../hooks/use-should-collapse-last-step';

const CheckoutTermsWrapper = styled.div< { shouldCollapseLastStep: boolean } >`
	& > * {
		margin: 16px 0;
		padding-left: 24px;
		position: relative;
	}

	.rtl & > * {
		margin: 16px 0;
		padding-right: 24px;
		padding-left: 0;
	}

	& div:first-of-type {
		padding-right: 0;
		padding-left: 0;
		margin-right: 0;
		margin-left: 0;
		margin-top: ${ ( { shouldCollapseLastStep } ) => ( shouldCollapseLastStep ? '0' : '32px' ) };
	}

	a {
		text-decoration: underline;
	}

	a:hover {
		text-decoration: none;
	}
`;

const PriceTallySection = styled.div< { shouldCollapseLastStep: boolean } >`
	padding-bottom: ${ ( { shouldCollapseLastStep } ) => ( shouldCollapseLastStep ? '24px' : '0' ) };
`;

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

export default function BeforeSubmitCheckoutHeader() {
	const cartKey = useCartKey();
	const { responseCart } = useShoppingCart( cartKey );
	const taxLineItems = getTaxBreakdownLineItemsFromCart( responseCart );
	const creditsLineItem = getCreditsLineItemFromCart( responseCart );
	const shouldCollapseLastStep = useShouldCollapseLastStep();
	return (
		<>
			<CheckoutTermsWrapper shouldCollapseLastStep={ shouldCollapseLastStep }>
				<CheckoutTerms cart={ responseCart } />
			</CheckoutTermsWrapper>

			{ ! hasCheckoutVersion( '2' ) && (
				<PriceTallySection shouldCollapseLastStep={ shouldCollapseLastStep }>
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
				</PriceTallySection>
			) }
		</>
	);
}
