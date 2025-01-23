import { useMutation } from '@tanstack/react-query';
import { UseMutationOptions } from '@tanstack/react-query/build/modern';
import wpcomRequest from 'wpcom-proxy-request';

interface migrationTicketAPIResponse {
	success: boolean;
}

interface APIError {
	status: number;
	code: string | null;
	message: string;
}

interface TicketRequest {
	locale: string;
	blog_url: string;
	from_url: string;
}

export const useSubmitMigrationTicket = <
	TData = migrationTicketAPIResponse | APIError,
	TError = APIError,
	TContext = unknown,
>(
	options: UseMutationOptions< TData, TError, TicketRequest, TContext > = {}
) => {
	const { mutate, mutateAsync, ...rest } = useMutation( {
		mutationFn: ( { locale, blog_url, from_url } ) =>
			wpcomRequest( {
				path: 'help/migration-ticket/new',
				apiNamespace: 'wpcom/v2/',
				apiVersion: '2',
				method: 'POST',
				body: {
					locale,
					blog_url,
					from_url,
				},
			} ),
		...options,
	} );

	return {
		sendTicket: mutate,
		sendTicketAsync: mutateAsync,
		...rest,
	};
};
