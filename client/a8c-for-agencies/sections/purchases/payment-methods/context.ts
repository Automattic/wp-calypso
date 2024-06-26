import { createContext } from 'react';
import type { PaymentMethodOverviewContext as PaymentMethodOverviewContextInterface } from './types';

export const PaymentMethodOverviewContext = createContext< PaymentMethodOverviewContextInterface >(
	{
		paging: undefined,
		setPaging: () => {
			return undefined;
		},
	}
);
