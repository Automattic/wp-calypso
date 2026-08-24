import { useUnifiedAiChat } from './use-unified-ai-chat';
import type { QueryClient } from '@tanstack/react-query';

/**
 * Pass a `queryClient` when calling this outside a `QueryClientProvider`.
 */
export const useShouldUseUnifiedAgent = ( queryClient?: QueryClient ) => {
	const { data: isEligibleViaAPI } = useUnifiedAiChat( true, queryClient );

	return isEligibleViaAPI;
};
