/**
 * External dependencies
 */
import React, { useContext, useState } from 'react';
import PropTypes from 'prop-types';

/**
 * Internal dependencies
 */
import CheckoutContext from '../lib/checkout-context';
import { getPaymentMethods } from '../lib/payment-methods';

export const CheckoutProvider = ( {
	callCheckoutEndpoint,
	total,
	items,
	localize,
	onSuccess,
	onFailure,
	successRedirectUrl,
	failureRedirectUrl,
	children,
} ) => {
	const paymentMethods = getPaymentMethods();
	const [ paymentMethodId, setPaymentMethodId ] = useState( paymentMethods[ 0 ].id );
	const [ paymentMethodData, setPaymentMethodData ] = useState( {} );
	const paymentMethod = getPaymentMethods().find( ( { id } ) => id === paymentMethodId );
	if (
		! callCheckoutEndpoint ||
		! total ||
		! items ||
		! localize ||
		! onSuccess ||
		! onFailure ||
		! successRedirectUrl ||
		! failureRedirectUrl
	) {
		throw new Error(
			'CheckoutProvider requires callCheckoutEndpoint, total, items, localize, onSuccess, onFailure, successRedirectUrl, and failureRedirectUrl'
		);
	}
	const value = {
		callCheckoutEndpoint,
		localize,
		paymentMethodId,
		total,
		items,
		paymentMethodData,
		setPaymentMethodData,
		setPaymentMethodId,
		onSuccess,
		onFailure,
		successRedirectUrl,
		failureRedirectUrl,
	};
	if ( paymentMethod && paymentMethod.CheckoutWrapper ) {
		const { CheckoutWrapper } = paymentMethod;
		return (
			<CheckoutContext.Provider value={ value }>
				<CheckoutWrapper>{ children }</CheckoutWrapper>
			</CheckoutContext.Provider>
		);
	}
	return <CheckoutContext.Provider value={ value }>{ children }</CheckoutContext.Provider>;
};

export const useCheckoutLineItems = () => {
	const { total, items } = useContext( CheckoutContext );
	return [ items, total ];
};

export const useCheckoutHandlers = () => {
	const { onSuccess, onFailure } = useContext( CheckoutContext );
	return { onSuccess, onFailure };
};

export const useCheckoutRedirects = () => {
	const { successRedirectUrl, failureRedirectUrl } = useContext( CheckoutContext );
	return { successRedirectUrl, failureRedirectUrl };
};

export const useCheckoutEndpoint = () => {
	const { callCheckoutEndpoint } = useContext( CheckoutContext );
	return callCheckoutEndpoint;
};

CheckoutProvider.propTypes = {
	total: PropTypes.object.isRequired,
	items: PropTypes.arrayOf( PropTypes.object ).isRequired,
	localize: PropTypes.func.isRequired,
	paymentMethodId: PropTypes.string,
	onSuccess: PropTypes.func.isRequired,
	onFailure: PropTypes.func.isRequired,
	successRedirectUrl: PropTypes.string.isRequired,
	failureRedirectUrl: PropTypes.string.isRequired,
};
