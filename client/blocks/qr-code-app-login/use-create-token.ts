import { useMutation } from '@tanstack/react-query';
import wp from 'calypso/lib/wp';
import type { Token } from './types';

export function useCreateToken() {
	return useMutation< Token, Error >( {
		mutationFn: () =>
			wp.req.post( {
				path: '/auth/qr-code-app/token',
				apiNamespace: 'wpcom/v2',
			} ),
	} );
}
