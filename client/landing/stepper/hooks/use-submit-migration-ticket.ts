import { requestSiteMigrationHelp } from '@automattic/api-core';
import { useMutation, type UseMutationOptions } from '@tanstack/react-query';

interface APIError {
	status: number;
	code: string | null;
	message: string;
}

export const useSubmitMigrationTicket = (
	options: UseMutationOptions<
		{ success: boolean },
		APIError,
		Parameters< typeof requestSiteMigrationHelp >[ 0 ]
	> = {}
) => {
	const { mutate, mutateAsync, ...rest } = useMutation( {
		mutationFn: requestSiteMigrationHelp,
		...options,
	} );

	return {
		sendTicket: mutate,
		sendTicketAsync: mutateAsync,
		...rest,
	};
};
