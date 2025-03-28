import { createContext } from 'react';
import { CheckoutContextInterface } from '../types';

const defaultCheckoutContext: CheckoutContextInterface = {
	paymentProcessors: {},
};

const CheckoutContext = createContext( defaultCheckoutContext );

export default CheckoutContext;
