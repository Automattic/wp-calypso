/* @format */

/**
 * External dependencies
 */
import React, { useState } from 'react';
import PropTypes from 'prop-types';

/**
 * Internal dependencies
 */
import joinClasses from './join-classes';
import localizeFactory, { useLocalize } from './localize';
import { CheckoutProvider } from './checkout-context';
import CheckoutStep from './checkout-step';
import CheckoutPaymentMethods from './checkout-payment-methods';

// Re-export the public API
export { CheckoutProvider, CheckoutStep, CheckoutPaymentMethods };

export default function Checkout( {
	locale,
	items,
	total,
	onChangeBillingContact,
	availablePaymentMethods,
	onSuccess,
	onFailure,
	successRedirectUrl,
	failureRedirectUrl,
	reviewContent,
	reviewContentCollapsed,
	upSell,
	checkoutHeader,
	orderReviewTOS,
	orderReviewFeatures,
	className,
} ) {
	const localize = localizeFactory( locale );
	const [ stepNumber, setStepNumber ] = useState( 1 );
	const [ paymentMethod, setPaymentMethod ] = useState( 'apple-pay' );

	return (
		<CheckoutProvider localize={ localize }>
			<section className={ joinClasses( className, 'checkout' ) }>
				<div>{ checkoutHeader || <h2>{ localize( 'Complete your purchase' ) }</h2> }</div>
				<PaymentMethodsStep
					availablePaymentMethods={ availablePaymentMethods }
					setStepNumber={ setStepNumber }
					collapsed={ stepNumber === 1 }
					paymentMethod={ paymentMethod }
					setPaymentMethod={ setPaymentMethod }
				/>
				{ upSell && <div>{ upSell }</div> }
			</section>
		</CheckoutProvider>
	);
}

Checkout.propTypes = {
	className: PropTypes.string,
	locale: PropTypes.string.isRequired,
	items: PropTypes.array.isRequired,
	total: PropTypes.object.isRequired,
	onChangeBillingContact: PropTypes.func,
	availablePaymentMethods: PropTypes.arrayOf( PropTypes.string ),
	onSuccess: PropTypes.func.isRequired,
	onFailure: PropTypes.func.isRequired,
	successRedirectUrl: PropTypes.string.isRequired,
	failureRedirectUrl: PropTypes.string.isRequired,
	reviewContent: PropTypes.element,
	reviewContentCollapsed: PropTypes.element,
	upSell: PropTypes.element,
	checkoutHeader: PropTypes.element,
	orderReviewTOS: PropTypes.element,
	orderReviewFeatures: PropTypes.element,
};

function PaymentMethodsStep( { setStepNumber, collapsed, availablePaymentMethods } ) {
	const localize = useLocalize();
	return (
		<div>
			<CheckoutStep
				collapsed={ collapsed }
				stepNumber="1"
				title={ localize( 'Pick a payment method' ) }
			>
				<CheckoutPaymentMethods />
			</CheckoutStep>
			<CheckoutStep
				collapsed={ ! collapsed }
				stepNumber="1"
				title={ localize( 'Payment method' ) }
				onEdit={ () => setStepNumber( 1 ) }
			>
				<CheckoutPaymentMethods
					collapsed
					availablePaymentMethods={ availablePaymentMethods }
					onChange={ setPaymentMethod }
				/>
			</CheckoutStep>
		</div>
	);
}
