/**
 * External dependencies
 */
import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { CheckoutProvider } from '@automattic/composite-checkout';

/**
 * Internal dependencies
 */
import WPCheckout from './wp-checkout';
import { useWpcomStore } from '../hooks/wpcom-store';

// These are used only for redirect payment methods
const successRedirectUrl = window.location.href;
const failureRedirectUrl = window.location.href;

// Called when the store is changed.
const handleCheckoutEvent = () => () => {
	// TODO: write this
};

// This is the parent component which would be included on a host page
export function WPCheckoutWrapper( {
	useShoppingCart,
	availablePaymentMethods,
	registry,
	onSuccess,
	onFailure,
} ) {
	const { itemsWithTax, total, deleteItem, changePlanLength } = useShoppingCart();

	const { select, subscribe, registerStore } = registry;
	useWpcomStore( registerStore );

	useEffect( () => {
		return subscribe( handleCheckoutEvent( select ) );
	}, [ select, subscribe ] );

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
			<WPCheckout deleteItem={ deleteItem } changePlanLength={ changePlanLength } />
		</CheckoutProvider>
	);
}

WPCheckoutWrapper.propTypes = {
	availablePaymentMethods: PropTypes.arrayOf( PropTypes.object ).isRequired,
	useShoppingCart: PropTypes.func.isRequired,
	registry: PropTypes.object.isRequired,
};
