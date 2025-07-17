import { recordTracksEvent } from '@automattic/calypso-analytics';
import { HelpCenterSelect } from '@automattic/data-stores';
import {
	useGetSupportInteractionById,
	useManageSupportInteraction,
} from '@automattic/odie-client/src/data';
import { useGetSupportInteractions } from '@automattic/odie-client/src/data/use-get-support-interactions';
import { useDispatch, useSelect } from '@wordpress/data';
import { useEffect } from '@wordpress/element';
import { useSearchParams, useLocation } from 'react-router-dom';
import { useHelpCenterContext } from '../contexts/HelpCenterContext';
import { HELP_CENTER_STORE } from '../stores';

export const useLastSupportInteraction = ( {
	isUserEligibleForPaidSupport,
	userFieldFlowName,
}: {
	isUserEligibleForPaidSupport: boolean;
	userFieldFlowName?: string;
} ) => {
	const { currentSupportInteraction } = useSelect( ( select ) => {
		const store = select( HELP_CENTER_STORE ) as HelpCenterSelect;
		return {
			currentSupportInteraction: store.getCurrentSupportInteraction(),
		};
	}, [] );

	const { setCurrentSupportInteraction } = useDispatch( HELP_CENTER_STORE );
	const { sectionName } = useHelpCenterContext();
	const { startNewInteraction } = useManageSupportInteraction();
	const [ searchParams ] = useSearchParams();
	const location = useLocation();
	const interactionId = searchParams.get( 'id' );
	const { data: openSupportInteractions, isLoading: isLoadingOpenSupportInteractions } =
		useGetSupportInteractions( null, 1, 'open', 1, ! interactionId );
	const { data: resolvedSupportInteractions, isLoading: isLoadingResolvedSupportInteractions } =
		useGetSupportInteractions( null, 1, 'resolved', 1, ! interactionId );
	const { data: supportInteraction } = useGetSupportInteractionById( interactionId );

	useEffect( () => {
		if ( currentSupportInteraction ) {
			return;
		}

		if ( supportInteraction ) {
			setCurrentSupportInteraction( supportInteraction );
			return;
		}

		if ( isLoadingOpenSupportInteractions || isLoadingResolvedSupportInteractions ) {
			return;
		}

		// If no interactions and nothing is set, start a new one
		if ( openSupportInteractions === null && resolvedSupportInteractions === null ) {
			startNewInteraction( {
				event_source: 'help-center',
				event_external_id: crypto.randomUUID(),
			} );

			recordTracksEvent( 'calypso_helpcenter_new_interaction_started', {
				pathname: location.pathname,
				search: location.search,
				section: sectionName,
				location: 'help-center',
				event_source: 'help-center',
				is_free_user: ! isUserEligibleForPaidSupport,
				user_field_flow_name: userFieldFlowName,
			} );
		}
		// If we have open or resolved interactions and none is selected
		else if ( openSupportInteractions || resolvedSupportInteractions ) {
			if ( resolvedSupportInteractions?.length ) {
				setCurrentSupportInteraction( resolvedSupportInteractions[ 0 ] );
			} else if ( openSupportInteractions?.length ) {
				setCurrentSupportInteraction( openSupportInteractions[ 0 ] );
			}
		}
	}, [
		currentSupportInteraction,
		supportInteraction,
		openSupportInteractions,
		resolvedSupportInteractions,
		isLoadingOpenSupportInteractions,
		isLoadingResolvedSupportInteractions,
		setCurrentSupportInteraction,
		startNewInteraction,
		location.pathname,
		location.search,
		sectionName,
		isUserEligibleForPaidSupport,
		userFieldFlowName,
	] );
};
