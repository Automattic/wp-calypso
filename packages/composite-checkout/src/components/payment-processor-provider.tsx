import { useMemo } from 'react';
import { PaymentProcessorProviderContext } from '../lib/payment-processor-provider-context';
import type { PaymentProcessorProp, PaymentProcessorProviderContextInterface } from '../types';

export function PaymentProcessorProvider( {
	paymentProcessors,
	children,
}: {
	paymentProcessors: PaymentProcessorProp;
	children: React.ReactNode;
} ) {
	const value: PaymentProcessorProviderContextInterface = useMemo(
		() => ( {
			paymentProcessors,
		} ),
		[ paymentProcessors ]
	);

	return (
		<PaymentProcessorProviderContext.Provider value={ value }>
			{ children }
		</PaymentProcessorProviderContext.Provider>
	);
}
