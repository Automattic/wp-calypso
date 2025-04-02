import { createContext } from 'react';
import { CheckoutContextInterface } from '../types';

const defaultCheckoutContext: CheckoutContextInterface = {
	allPaymentMethods: [],
	disabledPaymentMethodIds: [],
	setDisabledPaymentMethodIds: noop,
	paymentMethodId: null,
	setPaymentMethodId: noop,
	paymentProcessors: {},
};

// eslint-disable-next-line @typescript-eslint/no-empty-function
function noop(): void {}

const CheckoutContext = createContext( defaultCheckoutContext );

export default CheckoutContext;
