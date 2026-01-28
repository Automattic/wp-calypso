import { useQuery } from '@tanstack/react-query';
import wpcomRequest, { canAccessWpcomApis } from 'wpcom-proxy-request';
import { getUseUnifiedExperienceFromInlineData } from '../utils/load-external-providers';

interface CalypsoPreferencesResponse {
	calypso_preferences?: {
		unified_ai_chat?: boolean;
	};
}

/**
 * Determines if the user should see the unified AI chat experience.
 *
 * This hook uses a hybrid approach to work across all environments:
 *
 * 1. **wp-admin environments** (Atomic, Garden, Simple sites):
 *    The flag is available via `agentsManagerData.useUnifiedExperience`,
 *    injected server-side by Jetpack's Agents Manager.
 *
 * 2. **Calypso app** (wordpress.com):
 *    The flag is fetched from the `/me/preferences` endpoint.
 *
 * The rollout logic lives in Agents Manager (Jetpack) via the
 * `agents_manager_use_unified_experience` filter.
 */
export function useUnifiedAiChat( enabled = true ) {
	return useQuery< boolean, Error >( {
		queryKey: [ 'unified-ai-chat' ],
		queryFn: async () => {
			// 1. Check inline script first (available on wp-admin via Jetpack's Agents Manager)
			const inlineValue = getUseUnifiedExperienceFromInlineData();
			if ( inlineValue !== undefined ) {
				return inlineValue;
			}

			// 2. Fall back to /me/preferences endpoint for Calypso app (wordpress.com)
			if ( canAccessWpcomApis() ) {
				const response: CalypsoPreferencesResponse = await wpcomRequest( {
					path: '/me/preferences',
					apiVersion: '1.1',
				} );

				return response.calypso_preferences?.unified_ai_chat ?? false;
			}

			// 3. No data available - default to false
			return false;
		},
		enabled,
		refetchOnWindowFocus: false,
		staleTime: 300000, // 5 minutes
	} );
}
