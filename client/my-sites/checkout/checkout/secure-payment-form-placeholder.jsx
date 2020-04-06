/**
 * External dependencies
 */

import React from 'react';

/**
 * Internal dependencies
 */
import PaymentBox from './payment-box.jsx';

const SecurePaymentFormPlaceholder = () => {
	/*eslint-disable wpcalypso/jsx-classname-namespace */
	return (
		<PaymentBox classSet="selected is-empty" contentClassSet="selected is-empty">
			<div className="payment-box-section">
				<div className="placeholder-row placeholder" />
				<div className="placeholder-row placeholder" />
				<div className="placeholder-col-narrow placeholder-inline-pad">
					<div className="placeholder" />
				</div>
				<div className="placeholder-col-narrow placeholder-inline-pad-only-wide">
					<div className="placeholder" />
				</div>
				<div className="placeholder-col-wide">
					<div className="placeholder" />
				</div>
				<div className="placeholder-row placeholder" />
			</div>
			<div className="payment-box-section">
				<div className="placeholder-col-narrow placeholder-inline-pad">
					<div className="placeholder" />
				</div>
				<div className="placeholder-col-narrow">
					<div className="placeholder" />
				</div>
			</div>
			<div className="payment-box-hr" />
			<div className="placeholder-button-container">
				<div className="placeholder-col-narrow">
					<div className="placeholder placeholder-button" />
				</div>
			</div>
		</PaymentBox>
	);
	/*eslint-enable wpcalypso/jsx-classname-namespace */
};

export default SecurePaymentFormPlaceholder;
