import { useMutation } from '@tanstack/react-query';
import { UseMutationOptions } from '@tanstack/react-query/build/modern';
import { useCallback } from 'react';
import wpcomRequest from 'wpcom-proxy-request';

type Ticket = {
	subject: string;
	message: string;
	locale: string;
	source?: string;
	blog_url: string;
};

interface migrationTicketAPIResponse {
	success: boolean;
}

interface APIError {
	status: number;
	code: string | null;
	message: string;
}

export const useSubmitMigrationTicket = <
	TData = migrationTicketAPIResponse | APIError,
	TError = APIError,
	TContext = unknown,
>(
	options: UseMutationOptions< TData, TError, { ticket: Ticket }, TContext > = {}
) => {
	const { mutate, ...rest } = useMutation( {
		mutationFn: ( { ticket } ) =>
			wpcomRequest( {
				path: 'help/ticket/new',
				apiNamespace: 'wpcom/v2/',
				apiVersion: '2',
				method: 'POST',
				body: {
					...ticket,
					source: [ 'wpcom_moveto', 'wpcom_presales', 'ai_skip', 'wpcom_moveto_view' ],
				},
			} ),
		...options,
	} );

	const sendTicket = useCallback( ( ticket: Ticket ) => mutate( { ticket } ), [ mutate ] );

	return {
		sendTicket,
		...rest,
	};
};
