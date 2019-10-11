/* @format */

/**
 * External dependencies
 */
import React, { createContext } from 'react';

export const CheckoutContext = createContext( {} );

export const CheckoutProvider = ( { paymentMethod, localize, children } ) => {
	const value = { localize, paymentMethod };
	return <CheckoutContext.Provider value={ value }>{ children }</CheckoutContext.Provider>;
};
