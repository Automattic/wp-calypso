import { HelpCenterSelect } from '@automattic/data-stores';
import { HELP_CENTER_STORE } from '@automattic/help-center/src/stores';
import { useManageSupportInteraction } from '@automattic/odie-client/src/data';
import { useQueryClient } from '@tanstack/react-query';
import { useSelect, useDispatch } from '@wordpress/data';

export const useResetSupportInteraction = () => {
	const { currentSupportInteraction } = useSelect( ( select ) => {
		const store = select( HELP_CENTER_STORE ) as HelpCenterSelect;
		return {
			currentSupportInteraction: store.getCurrentSupportInteraction(),
		};
	}, [] );
	const { setCurrentSupportInteraction } = useDispatch( HELP_CENTER_STORE );
	const { resolveInteraction } = useManageSupportInteraction();
	const queryClient = useQueryClient();

	const reset = async () => {
		if ( currentSupportInteraction ) {
			resolveInteraction( { interactionId: currentSupportInteraction.uuid } );
			await queryClient.invalidateQueries( {
				queryKey: [ 'support-interactions', 'get-interactions', 'help-center' ],
			} );
			setCurrentSupportInteraction( null );
		}
	};

	return reset;
};
