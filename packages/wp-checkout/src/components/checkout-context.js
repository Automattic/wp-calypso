/* @format */

/**
 * External dependencies
 */
import React, { createContext, useContext } from 'react';

export const CheckoutContext = createContext( {} );

export const CheckoutProvider = ( { total, items, paymentMethod, localize, children } ) => {
	const value = { localize, paymentMethod, total, items };
	return <CheckoutContext.Provider value={ value }>{ children }</CheckoutContext.Provider>;
};

export const useCheckoutLineItems = () => {
	const { total, items } = useContext( CheckoutContext );
	return [ items, total ];
};
