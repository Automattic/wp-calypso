import { createContext } from 'react';
import { PaymentProcessorProviderContextInterface } from '../types';

const defaultContext: PaymentProcessorProviderContextInterface = {
	paymentProcessors: {},
};

export const PaymentProcessorProviderContext = createContext( defaultContext );
