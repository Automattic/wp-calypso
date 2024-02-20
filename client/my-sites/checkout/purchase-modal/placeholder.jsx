import { LoadingCheckoutSummaryFeaturesList } from '../src/components/wp-checkout-order-summary';

function OrderStep() {
	return (
		<div className="purchase-modal__step is-placeholder">
			<span className="purchase-modal__step-icon is-placeholder"></span>
			<div className="purchase-modal__step-title is-placeholder"></div>
			<div className="purchase-modal__step-content is-placeholder"></div>
		</div>
	);
}

function OrderReview() {
	return (
		<dl className="purchase-modal__review is-placeholder">
			<dt></dt>
			<dd></dd>
		</dl>
	);
}

function PayButton() {
	return <div className="purchase-modal__pay-button is-placeholder">Pay button</div>;
}

export default function PurchaseModalPlaceHolder( { showFeatureList } ) {
	return (
		<div className="purchase-modal__wrapper">
			<div className="purchase-modal__steps">
				<OrderStep />
				<OrderStep />
				<OrderStep />
				<OrderStep />
				<hr />
				<OrderReview />
				<PayButton />
			</div>
			{ showFeatureList && (
				<div className="purchase-modal__features is-placeholder">
					<LoadingCheckoutSummaryFeaturesList />
				</div>
			) }
		</div>
	);
}
