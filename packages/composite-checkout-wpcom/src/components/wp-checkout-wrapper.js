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
import { useShoppingCart } from '../hooks/use-shopping-cart';

// These are used only for redirect payment methods
const successRedirectUrl = window.location.href;
const failureRedirectUrl = window.location.href;

// Called when the store is changed.
const handleCheckoutEvent = () => () => {
	// TODO: write this
};

// This is the parent component which would be included on a host page
export function WPCheckoutWrapper( {
	siteSlug,
	setCart,
	getCart,
	availablePaymentMethods,
	registry,
	siteId,
	onSuccess,
	onFailure,
} ) {
	const { items, tax, total, removeItem, changePlanLength } = useShoppingCart(
		siteSlug,
		setCart,
		getCart
	);

	const { select, subscribe, registerStore } = registry;
	useWpcomStore( registerStore );

	useEffect( () => {
		return subscribe( handleCheckoutEvent( select ) );
	}, [ select, subscribe ] );

	return (
		<CheckoutProvider
			locale={ 'en-us' }
			items={ [ ...items, tax ] }
			total={ total }
			onSuccess={ onSuccess }
			onFailure={ onFailure }
			successRedirectUrl={ successRedirectUrl }
			failureRedirectUrl={ failureRedirectUrl }
			paymentMethods={ availablePaymentMethods }
			registry={ registry }
		>
			<WPCheckout
				removeItem={ removeItem }
				changePlanLength={ changePlanLength }
				siteId={ siteId }
			/>
		</CheckoutProvider>
	);
}

WPCheckoutWrapper.propTypes = {
	availablePaymentMethods: PropTypes.arrayOf( PropTypes.object ).isRequired,
	registry: PropTypes.object.isRequired,
	siteSlug: PropTypes.string,
	setCart: PropTypes.func.isRequired,
	getCart: PropTypes.func.isRequired,
	onSuccess: PropTypes.func.isRequired,
	onFailure: PropTypes.func.isRequired,
	siteId: PropTypes.oneOfType( [ PropTypes.string, PropTypes.number ] ),
};
