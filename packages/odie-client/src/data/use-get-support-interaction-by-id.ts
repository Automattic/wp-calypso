import { useQuery } from '@tanstack/react-query';
import { handleSupportInteractionsFetch } from './handle-support-interactions-fetch';

/**
 * Get the support interaction.
 * @param interactionId - The uuid of the Support Interaction.
 * @returns The support interaction.
 */
export const useGetSupportInteractionById = ( interactionId: number | null ) => {
	return useQuery( {
		queryKey: [ 'support-interactions', 'get-interaction-by-id', interactionId ],
		queryFn: () => handleSupportInteractionsFetch( 'GET', `/${ interactionId }` ),
		refetchOnWindowFocus: false,
		refetchOnReconnect: false,
		enabled: !! interactionId,
	} );
};
