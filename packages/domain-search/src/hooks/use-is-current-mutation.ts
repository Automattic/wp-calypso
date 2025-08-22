import { useQueryClient } from '@tanstack/react-query';

export const useIsCurrentMutation = ( submittedAt: number ) => {
	const queryClient = useQueryClient();

	const lastSubmittedAt = queryClient.getMutationCache().findAll().at( -1 )?.state.submittedAt;

	return lastSubmittedAt === submittedAt;
};
