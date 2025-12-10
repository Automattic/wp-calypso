import { isTestModeEnvironment, useCanConnectToZendeskMessaging } from '@automattic/zendesk-client';
import { useQuery, UseQueryResult } from '@tanstack/react-query';
import handleSupportInteractionsFetch from '../utils/handle-support-interactions-fetch';
import type { SupportInteraction, SupportProvider } from '../types';

export default function useGetSupportInteractions(
	provider: SupportProvider | null = null
): UseQueryResult< SupportInteraction[] > {
	const isTestMode = isTestModeEnvironment();
	const { data: canConnectToZendesk } = useCanConnectToZendeskMessaging();
	let shouldFetch = true;

	// Only fetch Zendesk interactions if the user can connect to Zendesk.
	if ( ( provider === 'zendesk' || provider === 'zendesk-staging' ) && ! canConnectToZendesk ) {
		shouldFetch = false;
	}

	return useQuery( {
		queryKey: [ 'agents-manager-support-interactions', provider, isTestMode ],
		queryFn: () => handleSupportInteractionsFetch( 'GET', '?per_page=100&page=1', isTestMode ),
		select: ( response ) => {
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

			// No filtering needed, return all interactions.
			return response;
		},
		enabled: shouldFetch,
		staleTime: 1000 * 30, // 30 seconds
	} );
}
