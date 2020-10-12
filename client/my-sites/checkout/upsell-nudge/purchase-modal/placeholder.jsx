/**
 * External dependencies
 */
import React from 'react';

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

export default function PurchaseModalPlaceHolder() {
	return (
		<>
			<OrderStep />
			<OrderStep />
			<hr />
			<OrderReview />
			<PayButton />
		</>
	);
}
