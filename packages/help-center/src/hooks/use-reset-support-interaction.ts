import { useManageSupportInteraction } from '@automattic/odie-client/src/data';
import { useCurrentSupportInteraction } from '@automattic/odie-client/src/data/use-current-support-interaction';
import { useQueryClient } from '@tanstack/react-query';

export const useResetSupportInteraction = () => {
	const { data: currentSupportInteraction } = useCurrentSupportInteraction();
	const { startNewInteraction, resolveInteraction, isMutating } = useManageSupportInteraction();
	const queryClient = useQueryClient();

	return {
		isMutating,
		resetSupportInteraction: async () => {
			if ( currentSupportInteraction ) {
				resolveInteraction( { interactionId: currentSupportInteraction.uuid } );

				await queryClient.invalidateQueries( {
					queryKey: [ 'support-interactions', 'get-interactions' ],
				} );
			}

			return await startNewInteraction( {
				event_source: 'help-center',
				event_external_id: crypto.randomUUID(),
			} );
		},
	};
};
