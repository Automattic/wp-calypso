import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient( {
	defaultOptions: {
		mutations: {
			networkMode: 'always',
			retry: false,
		},
	},
} );
