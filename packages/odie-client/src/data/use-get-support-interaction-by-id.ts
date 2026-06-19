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
			// Getting a support interaction by ID doesn't honor the isTestMode flag, so the
			// response can come back from either environment. Only reject a staging interaction
			// when we're NOT in test mode — production must never load staging data. Test-mode
			// clients (real staging, and local dev proxying to the production API) can read both,
			// so accept production interactions there: rejecting them treats every interaction as
			// "not found" and triggers an infinite create/navigate loop on local dev, where
			// is_test_mode is true but the backing data store is production.
			if ( ! isTestMode && interaction?.environment === 'staging' ) {
				throw new Error( 'Support interaction not found' );
			}
			return interaction;
		},
	} );

	return query;
};
