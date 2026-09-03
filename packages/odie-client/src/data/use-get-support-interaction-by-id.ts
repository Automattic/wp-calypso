import { isTestModeEnvironment } from '@automattic/zendesk-client';
import { useQuery } from '@tanstack/react-query';
import { SupportInteraction } from '../types';
import { handleSupportInteractionsFetch } from './handle-support-interactions-fetch';

/**
 * Query key of one support interaction. Shared with the code that writes to or
 * invalidates this cache entry, so none of it can drift from the query.
 * @param interactionId - The uuid of the Support Interaction.
 * @param isTestMode - Whether the interaction lives in the staging environment.
 * @returns The query key.
 */
export const getSupportInteractionQueryKey = (
	interactionId: string | null,
	isTestMode: boolean
) => [ 'support-interactions', 'get-interaction-by-id', interactionId, isTestMode ] as const;

/**
 * Get the support interaction.
 * @param interactionId - The uuid of the Support Interaction.
 * @returns The support interaction.
 */
export const useGetSupportInteractionById = ( interactionId: string | null ) => {
	const isTestMode = isTestModeEnvironment();
	const query = useQuery< SupportInteraction >( {
		queryKey: getSupportInteractionQueryKey( interactionId, isTestMode ),
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
