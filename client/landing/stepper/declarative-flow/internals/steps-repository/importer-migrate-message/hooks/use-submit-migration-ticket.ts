import { useMutation } from '@tanstack/react-query';
import { UseMutationOptions } from '@tanstack/react-query/build/modern';
import { useCallback } from 'react';
import wpcomRequest from 'wpcom-proxy-request';

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
	options: UseMutationOptions< TData, TError, { locale: string; blog_url: string }, TContext > = {}
) => {
	const { mutate, ...rest } = useMutation( {
		mutationFn: ( { locale, blog_url } ) =>
			wpcomRequest( {
				path: 'help/migration-ticket/new',
				apiNamespace: 'wpcom/v2/',
				apiVersion: '2',
				method: 'POST',
				body: {
					locale,
					blog_url,
				},
			} ),
		...options,
	} );

	const sendTicket = useCallback(
		( { locale, blog_url } ) => mutate( { locale, blog_url } ),
		[ mutate ]
	);

	return {
		sendTicket,
		...rest,
	};
};
