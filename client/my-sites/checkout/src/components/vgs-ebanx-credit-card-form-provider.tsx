/**
 * VGS Ebanx Credit Card Form Provider
 * Matches the working example from VGS documentation
 * Source: App.tsx pattern with VGSCollectProvider
 */

import { VGSCollectProvider } from '@vgs/collect-js-react';
import type { ReactNode } from 'react';

interface VgsEbanxCreditCardFormProviderProps {
	children: ReactNode;
}

/**
 * Simple provider wrapper matching the working example.
 * No custom context or state - uses VGS hooks directly.
 */
export const VgsEbanxCreditCardFormProvider = ( {
	children,
}: VgsEbanxCreditCardFormProviderProps ) => {
	return <VGSCollectProvider>{ children }</VGSCollectProvider>;
};
