/**
 * External dependencies
 */
import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { Checkout, CheckoutProvider, WPCheckoutOrderSummary } from '@automattic/composite-checkout';

/**
 * Internal dependencies
 */
import { OrderReview } from './order-review';

// These are used only for non-redirect payment methods
// TODO: write this
const onSuccess = () => alert( 'Payment succeeded!' );
const onFailure = error => alert( 'There was a problem with your payment' + error );

// These are used only for redirect payment methods
const successRedirectUrl = window.location.href;
const failureRedirectUrl = window.location.href;

// Called when the store is changed.
const handleCheckoutEvent = select => () => {
	// TODO: write this
	alert( `handleCheckoutEvent: ${ select }` );
};

// This is the parent component which would be included on a host page
export function WPCOMCheckout( { useShoppingCart, availablePaymentMethods, registry } ) {
	const { itemsWithTax, total, deleteItem, changePlanLength } = useShoppingCart();

	const { select, subscribe } = registry;

	useEffect( () => {
		return subscribe( handleCheckoutEvent( select ) );
	}, [ select, subscribe ] );

	const ReviewContent = () => (
		<OrderReview
			items={ itemsWithTax }
			total={ total }
			onDeleteItem={ deleteItem }
			onChangePlanLength={ changePlanLength }
		/>
	);

	return (
		<CheckoutProvider
			locale={ 'en-us' }
			items={ itemsWithTax }
			total={ total }
			onSuccess={ onSuccess }
			onFailure={ onFailure }
			successRedirectUrl={ successRedirectUrl }
			failureRedirectUrl={ failureRedirectUrl }
			paymentMethods={ availablePaymentMethods }
			registry={ registry }
		>
			<Checkout OrderSummary={ WPCheckoutOrderSummary } ReviewContent={ ReviewContent } />
		</CheckoutProvider>
	);
}

WPCOMCheckout.propTypes = {
	availablePaymentMethods: PropTypes.arrayOf( PropTypes.object ).isRequired,
	useShoppingCart: PropTypes.func.isRequired,
	registry: PropTypes.object.isRequired,
};
