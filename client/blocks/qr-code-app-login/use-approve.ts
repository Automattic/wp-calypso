import { useMutation } from '@tanstack/react-query';
import wp from 'calypso/lib/wp';

interface ApproveArgs {
	token: string;
	chosenNumber: number;
}

interface ApproveResponse {
	status: 'approved';
}

export interface ApiError extends Error {
	code?: string;
}

export function useApprove() {
	return useMutation< ApproveResponse, ApiError, ApproveArgs >( {
		mutationFn: ( { token, chosenNumber } ) =>
			wp.req.post(
				{ path: '/auth/qr-code-app/approve', apiNamespace: 'wpcom/v2' },
				{ token, chosen_number: chosenNumber }
			),
	} );
}
