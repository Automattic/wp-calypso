import { useMutation } from '@tanstack/react-query';
import wp from 'calypso/lib/wp';
import { logQrAppLoginError } from './log-error';
import type { ApiError, Token } from './types';

export function useCreateToken() {
	return useMutation< Token, ApiError >( {
		mutationFn: () =>
			wp.req.post( {
				path: '/auth/qr-code-app/token',
				apiNamespace: 'wpcom/v2',
			} ),
		onError: ( error ) => logQrAppLoginError( 'create-token', error ),
	} );
}
