import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { DomainSearchContext, useDomainSearchContextValue } from '../page/context';
import { buildCart } from './factories/cart';
import type { DomainSearchProps } from '../page/types';

export const TestDomainSearch = ( {
	cart = buildCart(),
	queryClient = new QueryClient( {
		defaultOptions: {
			queries: {
				retry: false,
			},
		},
	} ),
	...props
}: Partial< DomainSearchProps > & { queryClient?: QueryClient; children: React.ReactNode } ) => {
	const contextValue = useDomainSearchContextValue( { cart, ...props } );

	return (
		<QueryClientProvider client={ queryClient }>
			<DomainSearchContext.Provider value={ contextValue }>
				{ props.children }
			</DomainSearchContext.Provider>
		</QueryClientProvider>
	);
};
