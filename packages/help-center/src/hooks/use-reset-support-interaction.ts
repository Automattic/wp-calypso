import { useManageSupportInteraction } from '@automattic/odie-client/src/data';
import { useDispatch } from '@wordpress/data';
import { useCallback } from '@wordpress/element';
import { useHelpCenterContext } from '../contexts/HelpCenterContext';
import { HELP_CENTER_STORE } from '../stores';

export const useResetSupportInteraction = () => {
	const { setCurrentSupportInteraction } = useDispatch( HELP_CENTER_STORE );
	const { startNewInteraction } = useManageSupportInteraction();
	const { currentUser, site } = useHelpCenterContext();

	const reset = useCallback( async () => {
		startNewInteraction( {
			// @ts-expect-error - there is a mismatch between the types
			event_source: 'help-center',
			event_external_id: Number( `${ currentUser?.ID ?? site?.ID }${ Date.now() }` ), // Random ID to avoid conflicts
		} ).then( ( interaction ) => {
			setCurrentSupportInteraction( interaction );
		} );
	}, [ startNewInteraction, setCurrentSupportInteraction, currentUser, site ] );

	return reset;
};
