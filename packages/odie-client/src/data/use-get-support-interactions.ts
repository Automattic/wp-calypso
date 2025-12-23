import { isTestModeEnvironment, useCanConnectToZendeskMessaging } from '@automattic/zendesk-client';
import { useQuery } from '@tanstack/react-query';
import { useOdieAssistantContext } from '../context';
import { handleSupportInteractionsFetch } from './handle-support-interactions-fetch';
import type { SupportProvider } from '../types';

/**
 * Get the support interactions.
 * @returns Support interactions.
 */
export const useGetSupportInteractions = (
	provider: SupportProvider | null = null,
	enabled = true
) => {
	const isTestMode = isTestModeEnvironment();
	const { currentUser } = useOdieAssistantContext();
	const { data: canConnectToZendesk } = useCanConnectToZendeskMessaging( !! currentUser?.ID );
	let shouldFetch = enabled && !! currentUser?.ID;
	// Only fetch Zendesk interactions if the user can connect to Zendesk.
	if ( ( provider === 'zendesk' || provider === 'zendesk-staging' ) && ! canConnectToZendesk ) {
		shouldFetch = false;
	}

	return useQuery( {
		queryKey: [ 'support-interactions', 'get-interactions', isTestMode ],
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
		},
		enabled: shouldFetch,
		staleTime: 1000 * 30, // 30 seconds
	} );
};
