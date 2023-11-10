import { formatCurrency } from '@automattic/format-currency';
import { useShoppingCart } from '@automattic/shopping-cart';
import {
	getTotalLineItemFromCart,
	getTaxBreakdownLineItemsFromCart,
	getCreditsLineItemFromCart,
	NonProductLineItem,
	hasCheckoutVersion,
	LineItemType,
	getCouponLineItemFromCart,
	getSubtotalWithoutCoupon,
} from '@automattic/wpcom-checkout';
import styled from '@emotion/styled';
import { useTranslate } from 'i18n-calypso';
import useCartKey from 'calypso/my-sites/checkout/use-cart-key';
import CheckoutTerms from '../components/checkout-terms';
import { useShouldCollapseLastStep } from '../hooks/use-should-collapse-last-step';
import { WPOrderReviewSection } from './wp-order-review-line-items';

const CheckoutTermsWrapper = styled.div< { shouldCollapseLastStep: boolean } >`
	& > * {
		margin: 16px 0;
		padding-left: ${ hasCheckoutVersion( '2' ) ? null : '24px' };
		position: relative;
	}

	.rtl & > * {
		margin: 16px 0;
		padding-right: 24px;
		padding-left: 0;
	}

	& > div:first-of-type {
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

	& .checkout__terms-foldable-card {
		box-shadow: none;
		& .foldable-card__header {
			font-size: 12px;
			font-weight: 500;
			line-height: 1.5;
			padding: 0;
		}
		& .checkout__terms-item {
			margin-top: 0;

			& p {
				margin-bottom: 18px;
			}
		}
		& .foldable-card.is-expanded,
		.foldable-card__content {
			display: block;
			padding: 0;
			border-top: none;
			margin-top: 4px;
		}
		& .foldable-card__header.has-border .foldable-card__summary,
		.foldable-card__header.has-border .foldable-card__summary-expanded {
			margin-right: 60px;
		}
	}
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
	const couponLineItem = getCouponLineItemFromCart( responseCart );
	const shouldCollapseLastStep = useShouldCollapseLastStep();
	const translate = useTranslate();
	const subtotalWithoutCoupon = getSubtotalWithoutCoupon( responseCart );
	const subTotalLineItemWithoutCoupon: LineItemType = {
		id: 'subtotal-without-coupon',
		type: 'subtotal',
		label: translate( 'Subtotal' ),
		formattedAmount: formatCurrency( subtotalWithoutCoupon, responseCart.currency, {
			isSmallestUnit: true,
			stripZeros: true,
		} ),
	};

	return (
		<>
			<CheckoutTermsWrapper shouldCollapseLastStep={ shouldCollapseLastStep }>
				<CheckoutTerms cart={ responseCart } />
			</CheckoutTermsWrapper>

			{ ! hasCheckoutVersion( '2' ) && (
				<WPOrderReviewSection>
					<NonTotalPrices>
						<NonProductLineItem subtotal lineItem={ subTotalLineItemWithoutCoupon } />
						{ couponLineItem && <NonProductLineItem subtotal lineItem={ couponLineItem } /> }
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
