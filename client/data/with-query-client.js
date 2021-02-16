/**
 * External dependencies
 */
import React from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';

const queryClient = new QueryClient();

export function withQueryClient( Component ) {
	return ( props ) => (
		<QueryClientProvider client={ queryClient }>
			<Component { ...props } />
		</QueryClientProvider>
	);
}
