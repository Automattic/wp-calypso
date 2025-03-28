import { createContext } from 'react';
import { PaymentMethodProviderContextInterface } from '../types';

// eslint-disable-next-line @typescript-eslint/no-empty-function
function noop(): void {}

const defaultContext: PaymentMethodProviderContextInterface = {
	allPaymentMethods: [],
	disabledPaymentMethodIds: [],
	setDisabledPaymentMethodIds: noop,
	paymentMethodId: null,
	setPaymentMethodId: noop,
};

export const PaymentMethodProviderContext = createContext( defaultContext );
