import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useId, useSyncExternalStore } from 'react';

export const useIsCurrentMutation = () => {
	const queryClient = useQueryClient();
	const mutationId = useId();
	const mutationCache = queryClient.getMutationCache();

	// Subscribe to the cache so a mutation fired by another component
	// re-renders this one — otherwise a superseded error surface lingers
	// until something else happens to re-render it.
	const subscribe = useCallback(
		( onStoreChange: () => void ) => mutationCache.subscribe( onStoreChange ),
		[ mutationCache ]
	);

	const lastMutationId = useSyncExternalStore(
		subscribe,
		() => mutationCache.findAll().at( -1 )?.meta?.mutationId,
		() => undefined
	);

	return {
		mutationId,
		isCurrentMutation: lastMutationId === mutationId,
	};
};
