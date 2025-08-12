import { isTestModeEnvironment, useCanConnectToZendeskMessaging } from '@automattic/zendesk-client';
import { useQuery } from '@tanstack/react-query';
import { handleSupportInteractionsFetch } from './handle-support-interactions-fetch';
import type { SupportProvider } from '../types';

/**
 * Get the support interactions.
 * @returns Support interactions.
 */
export const useGetSupportInteractions = (
	provider: SupportProvider | null = null,
	per_page = 10,
	status: string | string[] = 'open',
	page = 1,
	enabled = true,
	freshness = 0
) => {
	const path = `?per_page=${ per_page }&page=${ page }&status=${ status }`;
	const isTestMode = isTestModeEnvironment();
	const { data: canConnectToZendesk } = useCanConnectToZendeskMessaging( enabled );
	let shouldFetch = enabled;
	// Only fetch Zendesk interactions if the user can connect to Zendesk.
	if ( ( provider === 'zendesk' || provider === 'zendesk-staging' ) && ! canConnectToZendesk ) {
		shouldFetch = false;
	}

	return useQuery( {
		queryKey: [
			'support-interactions',
			'get-interactions',
			provider,
			freshness,
			path,
			isTestMode,
			canConnectToZendesk,
		],
		queryFn: async () => {
			const response = await handleSupportInteractionsFetch( 'GET', path, isTestMode );

			if ( response.length === 0 ) {
				return null;
			}

			if ( provider ) {
				return response.filter( ( interaction ) =>
					interaction.events.some( ( event ) => event.event_source === provider )
				);
			} else if ( ! canConnectToZendesk ) {
				// When provider is null, we'll get interactions from all providers.
				// We need to filter out Zendesk interactions if the user can't connect to Zendesk.
				return response.filter(
					( interaction ) =>
						! interaction.events.some( ( event ) => event.event_source.includes( 'zendesk' ) )
				);
			}

			return response;
		},
		enabled: shouldFetch,
		staleTime: 1000 * 30, // 30 seconds
	} );
};
