import { getDefaultPaymentMethodStep } from '../../src/components/default-steps';
import {
	CheckoutStepGroup,
	CheckoutStepBody,
	CheckoutStep,
	CheckoutFormSubmit,
} from '../../src/public-api';
import CheckoutOrderSummary from '../utils/checkout-order-summary';

export interface LineItem {
	type: string;
	id: string;
	label: string;
	amount: number;
}

function OrderReviewLineItem( { item }: { item: LineItem } ) {
	const itemSpanId = `checkout-line-item-${ item.id }`;
	return (
		<div>
			<span id={ itemSpanId }>{ item.label }</span>
			<span aria-labelledby={ itemSpanId }>{ item.amount }</span>
		</div>
	);
}

function OrderReviewLineItems( { items }: { items: LineItem[] } ) {
	return (
		<div>
			{ items.map( ( item ) => (
				<OrderReviewLineItem key={ item.id } item={ item } />
			) ) }
		</div>
	);
}

function OrderReviewTotal( { total }: { total: LineItem } ) {
	return (
		<div>
			<OrderReviewLineItem item={ total } />
		</div>
	);
}

function CheckoutReviewOrder( { items }: { items: LineItem[] } ) {
	const total = items.reduce( ( sum, item ) => sum + item.amount, 0 );

	return (
		<div className="checkout-review-order">
			<div>
				<OrderReviewLineItems items={ items } />
			</div>
			<div>
				<OrderReviewTotal total={ { id: 'total', type: 'total', label: 'Total', amount: total } } />
			</div>
		</div>
	);
}

export function DefaultCheckoutSteps( { items }: { items: LineItem[] } ) {
	const paymentMethodStep = getDefaultPaymentMethodStep();
	return (
		<CheckoutStepGroup>
			<CheckoutStepBody
				activeStepContent={ <CheckoutOrderSummary items={ items } /> }
				titleContent="Order summary"
				isStepActive={ false }
				isStepComplete
				stepNumber={ 1 }
				stepId="order-summary-step"
			/>
			<CheckoutStep
				stepId="review-order-step"
				className="checkout__review-order-step"
				isCompleteCallback={ () => true }
				activeStepContent={ <CheckoutReviewOrder items={ items } /> }
				titleContent="Review your order"
			/>
			<CheckoutStep
				stepId="payment-method-step"
				isCompleteCallback={ () => true }
				activeStepContent={ paymentMethodStep.activeStepContent }
				completeStepContent={ paymentMethodStep.completeStepContent }
				titleContent={ paymentMethodStep.titleContent }
				className={ paymentMethodStep.className }
			/>
			<CheckoutFormSubmit />
		</CheckoutStepGroup>
	);
}
