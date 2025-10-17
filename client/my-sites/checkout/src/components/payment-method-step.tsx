import { useShoppingCart } from '@automattic/shopping-cart';
import styled from '@emotion/styled';
import { useTranslate } from 'i18n-calypso';
import useCartKey from 'calypso/my-sites/checkout/use-cart-key';
import CheckoutTerms from '../components/checkout-terms';

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

	return (
		<CheckoutTermsWrapper>
			<CheckoutTerms cart={ responseCart } />
		</CheckoutTermsWrapper>
	);
}
