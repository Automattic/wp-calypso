import { HelpCenterSelect } from '@automattic/data-stores';
import { HELP_CENTER_STORE } from '@automattic/help-center/src/stores';
import { useManageSupportInteraction } from '@automattic/odie-client/src/data';
import { useQueryClient } from '@tanstack/react-query';
import { useSelect } from '@wordpress/data';
import { v4 as uuidv4 } from 'uuid';

export const useResetSupportInteraction = () => {
	const { currentSupportInteraction } = useSelect( ( select ) => {
		const store = select( HELP_CENTER_STORE ) as HelpCenterSelect;
		return {
			currentSupportInteraction: store.getCurrentSupportInteraction(),
		};
	}, [] );
	const { startNewInteraction, resolveInteraction } = useManageSupportInteraction();
	const queryClient = useQueryClient();

	return async () => {
		if ( currentSupportInteraction ) {
			resolveInteraction( { interactionId: currentSupportInteraction.uuid } );

			await queryClient.invalidateQueries( {
				queryKey: [ 'support-interactions', 'get-interactions', 'help-center' ],
			} );

			return await startNewInteraction( {
				event_source: 'help-center',
				event_external_id: uuidv4(),
			} );
		}
	};
};
