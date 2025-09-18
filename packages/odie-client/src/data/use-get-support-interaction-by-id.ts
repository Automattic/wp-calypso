import { isTestModeEnvironment } from '@automattic/zendesk-client';
import { useQuery } from '@tanstack/react-query';
import { SupportInteraction } from '../types';
import { handleSupportInteractionsFetch } from './handle-support-interactions-fetch';

/**
 * Get the support interaction.
 * @param interactionId - The uuid of the Support Interaction.
 * @returns The support interaction.
 */
export const useGetSupportInteractionById = ( interactionId: string | null ) => {
	const isTestMode = isTestModeEnvironment();
	const query = useQuery< SupportInteraction >( {
		queryKey: [ 'support-interactions', 'get-interaction-by-id', interactionId, isTestMode ],
		queryFn: () =>
			handleSupportInteractionsFetch(
				'GET',
				`/${ interactionId }`,
				isTestMode
			) as unknown as Promise< SupportInteraction >,
		refetchOnWindowFocus: false,
		refetchOnReconnect: false,
		enabled: !! interactionId,
		staleTime: 1000 * 10, // 10 seconds
	} );

	return query;
};
