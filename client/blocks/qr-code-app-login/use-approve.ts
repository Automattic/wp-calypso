import { useMutation } from '@tanstack/react-query';
import wp from 'calypso/lib/wp';
import { logQrAppLoginError } from './log-error';
import type { ApiError } from './types';

interface ApproveArgs {
	token: string;
	chosenNumber: number;
}

interface ApproveResponse {
	status: 'approved';
}

export function useApprove() {
	return useMutation< ApproveResponse, ApiError, ApproveArgs >( {
		mutationFn: ( { token, chosenNumber } ) =>
			wp.req.post(
				{ path: '/auth/qr-code-app/approve', apiNamespace: 'wpcom/v2' },
				{ token, chosen_number: chosenNumber }
			),
		onError: ( error ) => logQrAppLoginError( 'approve', error ),
	} );
}
