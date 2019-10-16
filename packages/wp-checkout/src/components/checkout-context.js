/* @format */

/**
 * External dependencies
 */
import React, { createContext, useContext, useState } from 'react';

export const CheckoutContext = createContext( {} );

export const CheckoutProvider = ( { total, items, paymentMethod, localize, children } ) => {
	// TODO: validate props
	const [ paymentMethodData, setPaymentMethodData ] = useState( {} );
	const value = { localize, paymentMethod, total, items, paymentMethodData, setPaymentMethodData };
	return <CheckoutContext.Provider value={ value }>{ children }</CheckoutContext.Provider>;
};

export const useCheckoutLineItems = () => {
	const { total, items } = useContext( CheckoutContext );
	return [ items, total ];
};
