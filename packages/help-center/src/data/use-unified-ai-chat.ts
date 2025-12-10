import { useQuery } from '@tanstack/react-query';
import wpcomRequest, { canAccessWpcomApis } from 'wpcom-proxy-request';

interface MeResponse {
	unified_ai_chat?: boolean;
}

/**
 * Fetches the unified_ai_chat field from the /me endpoint.
 * This determines if the user should see the unified AI chat experience.
 *
 * The rollout logic lives in Agents Manager (Jetpack) via the
 * `agents_manager_use_unified_experience` filter.
 */
export function useUnifiedAiChat( enabled = true ) {
	return useQuery< boolean, Error >( {
		queryKey: [ 'unified-ai-chat' ],
		queryFn: async () => {
			if ( ! canAccessWpcomApis() ) {
				// For non-wpcom environments (Atomic/Garden), the filter is checked
				// server-side by Agents Manager. This API call won't work there.
				// The Help Center should rely on other signals in those environments.
				return false;
			}

			const response: MeResponse = await wpcomRequest( {
				path: '/me',
				apiVersion: '1.1',
				query: 'fields=unified_ai_chat',
			} );

			return response.unified_ai_chat ?? false;
		},
		enabled,
		refetchOnWindowFocus: false,
		staleTime: 300000, // 5 minutes
	} );
}
