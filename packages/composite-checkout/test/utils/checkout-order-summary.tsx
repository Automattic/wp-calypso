import styled from '@emotion/styled';
import { useI18n } from '@wordpress/react-i18n';

export interface LineItem {
	type: string;
	id: string;
	label: string;
	amount: number;
}

export const CheckoutSummaryCard = styled.div``;

const ProductList = styled.ul`
	margin: 0;
	padding: 0;
`;

const ProductListItem = styled.li`
	margin: 0;
	padding: 0;
	list-style-type: none;
`;

export default function CheckoutOrderSummaryStep( { items }: { items: LineItem[] } ) {
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

export function CheckoutOrderSummaryStepTitle( { total }: { total: string } ) {
	const { __ } = useI18n();
	return (
		<CheckoutSummaryStepTitle>
			<span>{ __( 'You are all set to check out' ) }</span>
			<CheckoutSummaryStepTotal>{ total }</CheckoutSummaryStepTotal>
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

export function CheckoutOrderSummary( { items }: { items: LineItem[] } ) {
	const taxes = items.filter( ( item ) => item.type === 'tax' );
	const total = items.reduce( ( sum, item ) => sum + item.amount, 0 );
	const { __ } = useI18n();

	return (
		<CheckoutSummaryCard>
			<CheckoutSummaryTitle>{ __( 'Purchase Details' ) }</CheckoutSummaryTitle>
			<CheckoutSummaryAmountWrapper>
				{ taxes.map( ( tax ) => (
					<CheckoutSummaryLineItem key={ 'checkout-summary-line-item-' + tax.id }>
						<span>{ tax.label }</span>
						<span>{ tax.amount }</span>
					</CheckoutSummaryLineItem>
				) ) }
				<CheckoutSummaryTotal>
					<span>{ __( 'Total' ) }</span>
					<span>{ total }</span>
				</CheckoutSummaryTotal>
			</CheckoutSummaryAmountWrapper>
		</CheckoutSummaryCard>
	);
}
