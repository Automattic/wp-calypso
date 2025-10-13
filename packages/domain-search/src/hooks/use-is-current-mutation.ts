import { useQueryClient } from '@tanstack/react-query';
import { useId } from 'react';

export const useIsCurrentMutation = () => {
	const queryClient = useQueryClient();
	const mutationId = useId();

	const lastMutationId = queryClient.getMutationCache().findAll().at( -1 )?.meta?.mutationId;

	return {
		mutationId,
		isCurrentMutation: lastMutationId === mutationId,
	};
};
