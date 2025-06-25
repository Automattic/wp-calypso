import { isTestModeEnvironment } from '@automattic/zendesk-client';
import { useQuery } from '@tanstack/react-query';
import { handleSupportInteractionsFetch } from './handle-support-interactions-fetch';

/**
 * Get the support interaction.
 * @param interactionId - The uuid of the Support Interaction.
 * @returns The support interaction.
 */
export const useGetSupportInteractionById = ( interactionId: string | null ) => {
	const isTestMode = isTestModeEnvironment();
	return useQuery( {
		queryKey: [ 'support-interactions', 'get-interaction-by-id', interactionId, isTestMode ],
		queryFn: () => handleSupportInteractionsFetch( 'GET', `/${ interactionId }`, isTestMode ),
		refetchOnWindowFocus: false,
		refetchOnReconnect: false,
		enabled: !! interactionId,
	} );
};
