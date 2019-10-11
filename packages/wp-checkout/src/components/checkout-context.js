/* @format */

/**
 * External dependencies
 */
import React, { createContext } from 'react';

export const CheckoutContext = createContext( {} );

export const CheckoutProvider = ( { localize, children } ) => {
	const value = { localize };
	return <CheckoutContext.Provider value={ value }>{ children }</CheckoutContext.Provider>;
};
