import styled from '@emotion/styled';
import { useI18n } from '@wordpress/react-i18n';
import { useLineItems, useLineItemsOfType, useTotal } from '../lib/line-items';
import { CheckoutSummaryCard } from './checkout-steps';

const ProductList = styled.ul`
	margin: 0;
	padding: 0;
`;

const ProductListItem = styled.li`
	margin: 0;
	padding: 0;
	list-style-type: none;
`;

export default function CheckoutOrderSummaryStep() {
	const [ items ] = useLineItems();

	return (
		<ProductList>
			{ items.map( ( product ) => {
				return <ProductListItem key={ product.id }>{ product.label }</ProductListItem>;
			} ) }
		</ProductList>
	);
}

const CheckoutSummaryStepTitle = styled.span`
	display: flex;
	justify-content: space-between;
`;

const CheckoutSummaryStepTotal = styled.span`
	font-weight: ${ ( props ) => props.theme.weights.bold };
`;

export function CheckoutOrderSummaryStepTitle() {
	const { __ } = useI18n();
	const total = useTotal();
	return (
		<CheckoutSummaryStepTitle>
			<span>{ __( 'You are all set to check out' ) }</span>
			<CheckoutSummaryStepTotal>{ total.amount.displayValue }</CheckoutSummaryStepTotal>
		</CheckoutSummaryStepTitle>
	);
}

const CheckoutSummaryTitle = styled.div`
	color: ${ ( props ) => props.theme.colors.textColor };
	font-weight: ${ ( props ) => props.theme.weights.bold };
	padding: 24px 20px;
`;

const CheckoutSummaryAmountWrapper = styled.div`
	border-top: 1px solid ${ ( props ) => props.theme.colors.borderColorLight };
	padding: 24px 20px;
`;

const CheckoutSummaryLineItem = styled.div`
	display: flex;
	justify-content: space-between;
`;

const CheckoutSummaryTotal = styled( CheckoutSummaryLineItem )`
	font-weight: ${ ( props ) => props.theme.weights.bold };
`;

export function CheckoutOrderSummary() {
	const { __ } = useI18n();
	const taxes = useLineItemsOfType( 'tax' );
	const total = useTotal();

	return (
		<CheckoutSummaryCard>
			<CheckoutSummaryTitle>{ __( 'Purchase Details' ) }</CheckoutSummaryTitle>
			<CheckoutSummaryAmountWrapper>
				{ taxes.map( ( tax ) => (
					<CheckoutSummaryLineItem key={ 'checkout-summary-line-item-' + tax.id }>
						<span>{ tax.label }</span>
						<span>{ tax.amount.displayValue }</span>
					</CheckoutSummaryLineItem>
				) ) }
				<CheckoutSummaryTotal>
					<span>{ __( 'Total' ) }</span>
					<span>{ total.amount.displayValue }</span>
				</CheckoutSummaryTotal>
			</CheckoutSummaryAmountWrapper>
		</CheckoutSummaryCard>
	);
}
