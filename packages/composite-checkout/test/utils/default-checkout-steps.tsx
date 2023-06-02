import {
	getDefaultOrderReviewStep,
	getDefaultOrderSummary,
	getDefaultOrderSummaryStep,
	getDefaultPaymentMethodStep,
	CheckoutStepGroup,
	CheckoutSummaryArea,
	CheckoutSummaryCard,
	CheckoutStepBody,
	CheckoutStep,
	CheckoutFormSubmit,
} from '../../src/public-api';

export function DefaultCheckoutSteps() {
	const orderSummary = getDefaultOrderSummary();
	const orderSummaryStep = getDefaultOrderSummaryStep();
	const paymentMethodStep = getDefaultPaymentMethodStep();
	const reviewOrderStep = getDefaultOrderReviewStep();
	return (
		<CheckoutStepGroup
			stepAreaHeader={
				<CheckoutSummaryArea className={ orderSummary.className }>
					<CheckoutSummaryCard>{ orderSummary.summaryContent }</CheckoutSummaryCard>
				</CheckoutSummaryArea>
			}
		>
			<CheckoutStepBody
				activeStepContent={ orderSummaryStep.activeStepContent }
				completeStepContent={ orderSummaryStep.completeStepContent }
				titleContent={ orderSummaryStep.titleContent }
				isStepActive={ false }
				isStepComplete={ true }
				stepNumber={ 1 }
				stepId="order-summary-step"
				className={ orderSummaryStep.className }
			/>
			<CheckoutStep
				stepId="review-order-step"
				isCompleteCallback={ () => true }
				activeStepContent={ reviewOrderStep.activeStepContent }
				completeStepContent={ reviewOrderStep.completeStepContent }
				titleContent={ reviewOrderStep.titleContent }
				className={ reviewOrderStep.className }
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
