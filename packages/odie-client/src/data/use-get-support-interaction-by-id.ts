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
		staleTime: 1000 * 10, // 10 seconds,
		select: ( interaction ) => {
			const env = isTestMode ? 'staging' : 'production';
			// getting a support interaction by ID doesn't honor the isTestMode flag, so we need to throw an error if the interaction is in staging and we're not in test mode.
			// this way to act as if the interaction is not found and create a new one. This is needed for people who have access to both staging and production.
			if ( interaction?.environment !== env ) {
				throw new Error( 'Support interaction not found' );
			}
			return interaction;
		},
	} );

	return query;
};
