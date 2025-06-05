import { HELP_CENTER_STORE } from '@automattic/help-center/src/stores';
import { useManageSupportInteraction } from '@automattic/odie-client/src/data';
import { useQueryClient } from '@tanstack/react-query';
import { useDispatch } from '@wordpress/data';

export const useStartSupportInteraction = () => {
	const { setCurrentSupportInteraction } = useDispatch( HELP_CENTER_STORE );
	const { startNewInteraction } = useManageSupportInteraction();
	const queryClient = useQueryClient();

	const startInteraction = async () => {
		const interaction = await startNewInteraction( {
			event_source: 'help-center',
			event_external_id: crypto.randomUUID(),
		} );
		await queryClient.invalidateQueries( {
			queryKey: [ 'support-interactions', 'get-interactions', 'help-center' ],
		} );
		setCurrentSupportInteraction( interaction );
	};

	return startInteraction;
};
