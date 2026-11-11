import { handleSupportInteractionsFetch } from '@automattic/odie-client/src/data/handle-support-interactions-fetch';
import { isTestModeEnvironment, useCanConnectToZendeskMessaging } from '@automattic/zendesk-client';
import { useQuery } from '@tanstack/react-query';
import { isCookieAuthMissing } from 'wpcom-proxy-request';
import { useHelpCenterContext } from '../contexts/HelpCenterContext';
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
	const { currentUser, site } = useHelpCenterContext();
	// No auth cookie yet (e.g. right after in-stepper signup) means these authed requests
	// would 401 and leave the panel stuck loading; skip them and render the logged-out home.
	const isAuthed = !! currentUser?.ID && ! isCookieAuthMissing();
	// Subscribe without fetching: the Help Center root triggers the check; here it only
	// hides Zendesk conversations once the user is known to be unable to open them.
	const { data: canConnectToZendesk, isError: canConnectErrored } = useCanConnectToZendeskMessaging(
		false,
		site?.ID
	);

	const isZendeskProvider = provider === 'zendesk' || provider === 'zendesk-staging';
	const shouldFetch = enabled && isAuthed;

	return useQuery( {
		queryKey: [ 'support-interactions', 'get-interactions', isTestMode ],
		queryFn: () => handleSupportInteractionsFetch( 'GET', '?per_page=100&page=1', isTestMode ),
		select: ( response ) => {
			if ( provider ) {
				if ( isZendeskProvider && ( canConnectToZendesk === false || canConnectErrored ) ) {
					return [];
				}
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
