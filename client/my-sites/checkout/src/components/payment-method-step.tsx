import { useShoppingCart } from '@automattic/shopping-cart';
import {
	getTotalLineItemFromCart,
	getTaxBreakdownLineItemsFromCart,
	getCreditsLineItemFromCart,
	NonProductLineItem,
	LineItemType,
	getSubtotalWithoutDiscounts,
	getTotalDiscountsWithoutCredits,
	isBillingInfoEmpty,
} from '@automattic/wpcom-checkout';
import styled from '@emotion/styled';
import { formatCurrency, useTranslate } from 'i18n-calypso';
import useCartKey from 'calypso/my-sites/checkout/use-cart-key';
import CheckoutTerms from '../components/checkout-terms';
import { WPOrderReviewSection } from './wp-order-review-line-items';

const CheckoutTermsWrapper = styled.div`
	& > * {
		margin: 16px 0;
		padding-left: 0;
		position: relative;
	}

	.rtl & > * {
		margin: 16px 0;
		padding-right: 24px;
		padding-left: 0;
	}

	a {
		text-decoration: underline;
	}

	a:hover {
		text-decoration: none;
	}

	& .checkout__terms-foldable-card {
		box-shadow: none;
		padding: 0;
		&.is-compact .foldable-card__header {
			font-size: 12px;
			font-weight: 500;
			line-height: 1.5;
			padding: 0;
		}
		&.is-expanded .foldable-card__content {
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
	padding: 16px 0 6px;
`;

const TaxNotCalculatedLineItemWrapper = styled.div`
	font-size: 14px;
	text-wrap: pretty;
	line-height: 1em;
	color: ${ ( { theme } ) => theme.colors.textColorLight };
	margin-bottom: 8px;
`;

export function TaxNotCalculatedLineItem() {
	const translate = useTranslate();
	return (
		<TaxNotCalculatedLineItemWrapper>
			{ translate( 'Tax: to be calculated', {
				textOnly: true,
			} ) }
		</TaxNotCalculatedLineItemWrapper>
	);
}

export default function BeforeSubmitCheckoutHeader() {
	const cartKey = useCartKey();
	const { responseCart } = useShoppingCart( cartKey );
	const taxLineItems = getTaxBreakdownLineItemsFromCart( responseCart );
	const creditsLineItem = getCreditsLineItemFromCart( responseCart );
	const translate = useTranslate();

	const totalDiscount = getTotalDiscountsWithoutCredits( responseCart );
	const discountLineItem: LineItemType = {
		id: 'total-discount',
		type: 'subtotal',
		label: translate( 'Discounts' ),
		formattedAmount: formatCurrency( totalDiscount, responseCart.currency, {
			isSmallestUnit: true,
			stripZeros: true,
		} ),
	};

	const subtotalBeforeDiscounts = getSubtotalWithoutDiscounts( responseCart );
	const subTotalLineItemWithoutCoupon: LineItemType = {
		id: 'subtotal-without-coupon',
		type: 'subtotal',
		label: totalDiscount !== 0 ? translate( 'Subtotal before discounts' ) : translate( 'Subtotal' ),
		formattedAmount: formatCurrency( subtotalBeforeDiscounts, responseCart.currency, {
			isSmallestUnit: true,
			stripZeros: true,
		} ),
	};

	return (
		<>
			<CheckoutTermsWrapper>
				<CheckoutTerms cart={ responseCart } />
			</CheckoutTermsWrapper>
			<WPOrderReviewSection>
				<NonTotalPrices>
					<NonProductLineItem subtotal lineItem={ subTotalLineItemWithoutCoupon } />
					{ totalDiscount !== 0 && <NonProductLineItem subtotal lineItem={ discountLineItem } /> }
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
				{ isBillingInfoEmpty( responseCart ) && <TaxNotCalculatedLineItem /> }
			</WPOrderReviewSection>
		</>
	);
}
